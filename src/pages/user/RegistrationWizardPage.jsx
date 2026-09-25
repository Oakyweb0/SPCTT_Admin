import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, registrationApi } from '../../services/api';

const RegistrationWizardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active step: 1 (Category), 2 (Attendee), 3 (Accompanying), 4 (Billing & Payment), 5 (Success/Receipt)
  const initialStep = parseInt(searchParams.get('step') || '1');
  const [currentStep, setCurrentStep] = useState(initialStep);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Categories list
  const [categories, setCategories] = useState([
    { id: 1, code: 'SPCTT_MEMBERS', name: 'SPCTT Members (Consultants)', price: 3250 },
    { id: 2, code: 'NON_MEMBERS', name: 'Non-Members (Consultants)', price: 4000 },
    { id: 3, code: 'FELLOWS_STUDENTS', name: 'Fellows/ Students', price: 2500 },
    { id: 4, code: 'NURSES', name: 'Nurses', price: 2000 },
    { id: 5, code: 'INDUSTRY_DELEGATES', name: 'Industry Delegates', price: 6000 },
    { id: 6, code: 'ACCOMPANYING_PERSONS', name: 'Accompanying Persons (including children > 10 yrs old)', price: 4000 }
  ]);

  // Selected Category (Step 1)
  const [selectedCategoryId, setSelectedCategoryId] = useState(2);

  // Attendee & Contact Form (Step 2)
  const [attendeeData, setAttendeeData] = useState({
    title: 'Mr.',
    fullName: '',
    email: '',
    organization: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'United Kingdom',
    pincode: ''
  });

  // Accompanying Persons (Step 3)
  const [accompanyingCount, setAccompanyingCount] = useState(0); // 0, 1, 2
  const [accompanyingPersons, setAccompanyingPersons] = useState([
    { title: 'Mrs.', fullName: '' },
    { title: 'Mr.', fullName: '' }
  ]);

  // Billing Details (Step 4)
  const [billingData, setBillingData] = useState({
    entityName: '',
    entityAddress: '',
    gstNumber: '',
    panNumber: ''
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('Axis Razorpay (PAGE WORLDWIDE)');

  // Full registration record from server
  const [registration, setRegistration] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Load existing user & registration state
  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [catsRes, regRes] = await Promise.all([
          registrationApi.getCategories().catch(() => null),
          registrationApi.getCurrentRegistration().catch(() => null)
        ]);

        if (catsRes?.data?.length > 0) {
          setCategories(catsRes.data);
        }

        const user = auth.user || {};
        const reg = regRes?.data?.registration;

        if (reg) {
          setRegistration(reg);
          if (reg.category_id) {
            setSelectedCategoryId(reg.category_id);
          }
          setAttendeeData({
            title: reg.title || user.title || 'Mr.',
            fullName: reg.full_name || user.name || '',
            email: reg.email || user.email || '',
            organization: reg.organization || user.organization || '',
            phone: reg.phone || user.phone || '',
            address: reg.address || user.address || '',
            city: reg.city || user.city || '',
            state: reg.state || user.state || '',
            country: reg.country || user.country || 'United Kingdom',
            pincode: reg.pincode || user.pincode || ''
          });

          setAccompanyingCount(reg.accompanying_count || 0);
          if (Array.isArray(reg.accompanying_persons) && reg.accompanying_persons.length > 0) {
            setAccompanyingPersons([
              reg.accompanying_persons[0] || { title: 'Mrs.', fullName: '' },
              reg.accompanying_persons[1] || { title: 'Mr.', fullName: '' }
            ]);
          }

          setBillingData({
            entityName: reg.billing_entity_name || '',
            entityAddress: reg.billing_address || '',
            gstNumber: reg.gst_number || '',
            panNumber: reg.pan_number || ''
          });

          if (regRes?.data?.invoices) {
            setInvoices(regRes.data.invoices);
          }

          if (reg.payment_status === 'paid' && !searchParams.get('step')) {
            setCurrentStep(5);
          }
        } else {
          // Initialize defaults from user profile
          setAttendeeData(prev => ({
            ...prev,
            title: user.title || 'Mr.',
            fullName: user.name || '',
            email: user.email || '',
            organization: user.organization || '',
            phone: user.phone || ''
          }));
        }
      } catch (err) {
        console.error('Error initializing registration wizard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  // Sync step query param
  const setStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    setSearchParams({ step: stepNumber });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper formatting for currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ----------------------------------------------------
  // STEP 1 HANDLER: Save Category
  // ----------------------------------------------------
  const handleStep1Proceed = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);
      const res = await registrationApi.saveStep1Category({
        categoryId: selectedCategoryId
      });

      if (res.status) {
        setStep(2);
      } else {
        setError(res.message || 'Failed to select category.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // STEP 2 HANDLER: Save Attendee & Contact Details
  // ----------------------------------------------------
  const handleStep2Save = async (e) => {
    e.preventDefault();
    setError('');

    if (!attendeeData.fullName.trim() || !attendeeData.email.trim() || !attendeeData.organization.trim() || !attendeeData.address.trim() || !attendeeData.city.trim() || !attendeeData.state.trim()) {
      setError('Please fill all mandatory attendee and contact fields marked with *');
      return;
    }

    try {
      setSaving(true);
      const res = await registrationApi.saveStep2Attendee(attendeeData);
      if (res.status) {
        setStep(3);
      } else {
        setError(res.message || 'Failed to save attendee details.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save attendee details.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3 HANDLER: Save Accompanying Persons
  // ----------------------------------------------------
  const handleStep3Save = async (e) => {
    e.preventDefault();
    setError('');

    if (accompanyingCount > 0) {
      for (let i = 0; i < accompanyingCount; i++) {
        if (!accompanyingPersons[i]?.fullName?.trim()) {
          setError(`Please provide the full name for Accompanying Person #${i + 1}`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      const res = await registrationApi.saveStep3Accompanying({
        count: accompanyingCount,
        accompanyingPersons: accompanyingPersons.slice(0, accompanyingCount)
      });

      if (res.status) {
        // Auto trigger billing calculation
        const billRes = await registrationApi.saveStep4Billing(billingData);
        if (billRes?.data) {
          if (billRes.data.invoices) setInvoices(billRes.data.invoices);
        }
        setStep(4);
      } else {
        setError(res.message || 'Failed to save accompanying persons.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save accompanying persons.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // STEP 4 HANDLERS: Save Billing & Make Payment
  // ----------------------------------------------------
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  const handleMakePayment = async () => {
    setError('');

    try {
      setSaving(true);
      // Ensure billing details are saved
      await registrationApi.saveStep4Billing(billingData);

      // Execute Payment
      const payRes = await registrationApi.makePayment({
        paymentMethod
      });

      if (payRes.status && payRes.data) {
        setPaymentSuccessData(payRes.data);
        setRegistration(payRes.data.registration);
        setInvoices(payRes.data.invoices || []);
        setStep(5);
      } else {
        setError(payRes.message || 'Payment processing failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during payment processing.');
    } finally {
      setSaving(false);
    }
  };

  // Calculated values for Step 4 Preview
  const selectedCat = categories.find(c => c.id === parseInt(selectedCategoryId)) || categories[1];
  const catRate = parseFloat(selectedCat?.price || 4000);
  const catGst = parseFloat(((catRate * 18) / 100).toFixed(2));

  const accRate = accompanyingCount > 0 ? accompanyingCount * 3500 : 0;
  const accGst = parseFloat(((accRate * 18) / 100).toFixed(2));

  const grandSubtotal = catRate + accRate;
  const grandGst = catGst + accGst;
  const grandTotal = grandSubtotal + grandGst;

  const getPageTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Category';
      case 2: return 'Attendee Details';
      case 3: return 'Optional Item(s) Registration';
      case 4: return 'Billing Details';
      case 5: return 'Payment Confirmed';
      default: return 'Registration';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <UserHeader pageTitle="Loading Registration..." />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
          <div className="w-8 h-8 border-4 border-[#004b63] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle={getPageTitle()} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-14">
        {/* Progress Step Indicator */}
        <div className="mb-10 max-w-2xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium text-gray-500 border-b border-gray-200 pb-4">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 focus:outline-none ${currentStep === 1 ? 'text-[#9e1c2b] font-bold' : currentStep > 1 ? 'text-[#004b63]' : ''}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep === 1 ? 'bg-[#9e1c2b]' : currentStep > 1 ? 'bg-[#004b63]' : 'bg-gray-300'}`}>1</span>
            <span>Category</span>
          </button>
          <span className="text-gray-300">───</span>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 focus:outline-none ${currentStep === 2 ? 'text-[#9e1c2b] font-bold' : currentStep > 2 ? 'text-[#004b63]' : ''}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep === 2 ? 'bg-[#9e1c2b]' : currentStep > 2 ? 'bg-[#004b63]' : 'bg-gray-300'}`}>2</span>
            <span>Attendee</span>
          </button>
          <span className="text-gray-300">───</span>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 focus:outline-none ${currentStep === 3 ? 'text-[#9e1c2b] font-bold' : currentStep > 3 ? 'text-[#004b63]' : ''}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep === 3 ? 'bg-[#9e1c2b]' : currentStep > 3 ? 'bg-[#004b63]' : 'bg-gray-300'}`}>3</span>
            <span>Optional Items</span>
          </button>
          <span className="text-gray-300">───</span>

          <button
            onClick={() => setStep(4)}
            className={`flex items-center gap-1.5 focus:outline-none ${currentStep === 4 ? 'text-[#9e1c2b] font-bold' : currentStep > 4 ? 'text-[#004b63]' : ''}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep === 4 ? 'bg-[#9e1c2b]' : currentStep > 4 ? 'bg-[#004b63]' : 'bg-gray-300'}`}>4</span>
            <span>Billing & Payment</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SELECT CATEGORY */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="border-b border-[#a01c2b]/30 pb-3 mb-8">
              <p className="text-gray-600 text-sm">Please choose your appropriate registration category below:</p>
            </div>

            <form onSubmit={handleStep1Proceed} className="space-y-6">
              <div className="space-y-4 max-w-xl mx-auto">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between p-3.5 rounded border transition-all cursor-pointer select-none ${
                      selectedCategoryId === cat.id
                        ? 'border-[#004b63] bg-teal-50/40 text-gray-900 font-medium ring-1 ring-[#004b63]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        name="registrationCategory"
                        value={cat.id}
                        checked={selectedCategoryId === cat.id}
                        onChange={() => setSelectedCategoryId(cat.id)}
                        className="w-4 h-4 text-[#004b63] border-gray-300 focus:ring-[#004b63] cursor-pointer"
                      />
                      <span className="text-sm md:text-base">{cat.name}</span>
                    </div>
                    <span className="text-sm md:text-base font-semibold text-gray-900">
                      {formatCurrency(cat.price)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-8 text-center sm:text-left max-w-xl mx-auto">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Proceed'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ATTENDEE DETAILS & CONTACT INFORMATION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Save} className="space-y-10">
            {/* Section: Attendee Details */}
            <div>
              <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2 mb-6">
                Attendee Details
              </h3>

              <div className="space-y-5">
                {/* Row 1: Title, Full Name, Email Address */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={attendeeData.title}
                      onChange={(e) => setAttendeeData({ ...attendeeData, title: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={attendeeData.fullName}
                      onChange={(e) => setAttendeeData({ ...attendeeData, fullName: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={attendeeData.email}
                      onChange={(e) => setAttendeeData({ ...attendeeData, email: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Organization & Mobile Number */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization / Institution Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={attendeeData.organization}
                      onChange={(e) => setAttendeeData({ ...attendeeData, organization: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center border border-gray-300 rounded h-11 overflow-hidden focus-within:border-[#004b63] focus-within:ring-1 focus-within:ring-[#004b63]">
                      <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={attendeeData.phone}
                        onChange={(e) => setAttendeeData({ ...attendeeData, phone: e.target.value })}
                        placeholder="1234 567 890"
                        maxLength={15}
                        className="flex-1 h-full px-3 text-gray-800 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Max Length : 15 Numbers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2 mb-6">
                Contact Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={attendeeData.address}
                    onChange={(e) => setAttendeeData({ ...attendeeData, address: e.target.value })}
                    placeholder="Street address line number one&#10;Street address line number two"
                    className="w-full p-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={attendeeData.city}
                      onChange={(e) => setAttendeeData({ ...attendeeData, city: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State / Province <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={attendeeData.state}
                      onChange={(e) => setAttendeeData({ ...attendeeData, state: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={attendeeData.country}
                      onChange={(e) => setAttendeeData({ ...attendeeData, country: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                      required
                    >
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="Singapore">Singapore</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode / Zipcode
                    </label>
                    <input
                      type="text"
                      value={attendeeData.pincode}
                      onChange={(e) => setAttendeeData({ ...attendeeData, pincode: e.target.value })}
                      placeholder="e.g. 110001 or FK10 1JJ"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2.5 text-sm font-medium"
              >
                Back to Category
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: OPTIONAL ITEM(S) REGISTRATION / ACCOMPANYING PERSONS */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <form onSubmit={handleStep3Save} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2 mb-6">
                Accompanying Person(s) Registration
              </h3>

              <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded mb-6 text-sm text-amber-900">
                <p>
                  <strong>Note:</strong> Accompanying person registration fee is <strong>₹3,500.00</strong> per person (plus 18% GST).
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Do you want to register Accompanying Persons?
                  </label>
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                      <input
                        type="radio"
                        name="accompanyingOption"
                        checked={accompanyingCount === 1}
                        onChange={() => setAccompanyingCount(1)}
                        className="w-4 h-4 text-[#004b63] border-gray-300 focus:ring-[#004b63]"
                      />
                      <span className="font-medium">1</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                      <input
                        type="radio"
                        name="accompanyingOption"
                        checked={accompanyingCount === 2}
                        onChange={() => setAccompanyingCount(2)}
                        className="w-4 h-4 text-[#004b63] border-gray-300 focus:ring-[#004b63]"
                      />
                      <span className="font-medium">2</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                      <input
                        type="radio"
                        name="accompanyingOption"
                        checked={accompanyingCount === 0}
                        onChange={() => setAccompanyingCount(0)}
                        className="w-4 h-4 text-[#004b63] border-gray-300 focus:ring-[#004b63]"
                      />
                      <span className="font-medium">No, Thank you</span>
                    </label>
                  </div>
                </div>

                {/* Accompanying Person # 1 */}
                {accompanyingCount >= 1 && (
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg space-y-4 animate-fadeIn">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      Accompanying Persons # 1 Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Accompanying Persons # 1 Title
                        </label>
                        <select
                          value={accompanyingPersons[0].title}
                          onChange={(e) => {
                            const updated = [...accompanyingPersons];
                            updated[0].title = e.target.value;
                            setAccompanyingPersons(updated);
                          }}
                          className="w-full h-10 px-3 border border-gray-300 rounded bg-white text-sm"
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Accompanying Persons # 1 Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={accompanyingPersons[0].fullName}
                          onChange={(e) => {
                            const updated = [...accompanyingPersons];
                            updated[0].fullName = e.target.value;
                            setAccompanyingPersons(updated);
                          }}
                          placeholder="e.g. Mrs. Anjali Tiwari"
                          className="w-full h-10 px-3 border border-gray-300 rounded text-sm bg-white"
                          required={accompanyingCount >= 1}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Accompanying Person # 2 */}
                {accompanyingCount >= 2 && (
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg space-y-4 animate-fadeIn">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      Accompanying Persons # 2 Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Accompanying Persons # 2 Title
                        </label>
                        <select
                          value={accompanyingPersons[1].title}
                          onChange={(e) => {
                            const updated = [...accompanyingPersons];
                            updated[1].title = e.target.value;
                            setAccompanyingPersons(updated);
                          }}
                          className="w-full h-10 px-3 border border-gray-300 rounded bg-white text-sm"
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Accompanying Persons # 2 Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={accompanyingPersons[1].fullName}
                          onChange={(e) => {
                            const updated = [...accompanyingPersons];
                            updated[1].fullName = e.target.value;
                            setAccompanyingPersons(updated);
                          }}
                          placeholder="e.g. Mr. Rahul Tiwari"
                          className="w-full h-10 px-3 border border-gray-300 rounded text-sm bg-white"
                          required={accompanyingCount >= 2}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Proceed'}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2.5 text-sm font-medium"
              >
                Back to Attendee Details
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: BILLING DETAILS & MAKE PAYMENT */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-10">
            {/* Section: Billing Details Form */}
            <div>
              <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2 mb-6">
                Billing Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Entity Name
                    </label>
                    <input
                      type="text"
                      name="entityName"
                      value={billingData.entityName}
                      onChange={handleBillingChange}
                      placeholder="e.g. Oakyweb Technologies / Individual"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Entity Address
                    </label>
                    <input
                      type="text"
                      name="entityAddress"
                      value={billingData.entityAddress}
                      onChange={handleBillingChange}
                      placeholder="e.g. 1 Primrose Street, Delhi"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={billingData.gstNumber}
                      onChange={handleBillingChange}
                      placeholder="e.g. 07AAAAA0000A1Z5 (Optional)"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 uppercase focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={billingData.panNumber}
                      onChange={handleBillingChange}
                      placeholder="e.g. ABCDE1234F (Optional)"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 uppercase focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Proforma Invoice / Item Breakdown Table */}
            <div>
              <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2 mb-6">
                Order & Fee Summary
              </h3>

              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-semibold">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 text-center w-20">Qty</th>
                      <th className="py-3 px-4 text-right w-28">Rate</th>
                      <th className="py-3 px-4 text-right w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {/* Primary Registration Item */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4">
                        <span className="text-[#004b63] font-semibold block text-xs tracking-wide">
                          [Proforma Invoice 140]
                        </span>
                        <span className="font-medium text-gray-900">
                          New Subscription - {selectedCat.name}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          #{registration?.registration_code || 'REG-1287024'}: {attendeeData.title} {attendeeData.fullName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">1</td>
                      <td className="py-3.5 px-4 text-right">{formatCurrency(catRate)}</td>
                      <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(catRate)}</td>
                    </tr>
                    <tr className="bg-gray-50/40 text-xs text-gray-600">
                      <td className="py-2 px-4 italic text-right" colSpan={3}>18% GST</td>
                      <td className="py-2 px-4 text-right font-medium text-gray-800">{formatCurrency(catGst)}</td>
                    </tr>

                    {/* Accompanying Persons if any */}
                    {accompanyingCount > 0 && (
                      <>
                        <tr className="hover:bg-gray-50/50">
                          <td className="py-3.5 px-4">
                            <span className="text-[#004b63] font-semibold block text-xs tracking-wide">
                              [Proforma Invoice 141]
                            </span>
                            <span className="font-medium text-gray-900">
                              Accompanying Person #{accompanyingCount} Cost
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {accompanyingPersons.slice(0, accompanyingCount).map(p => `${p.title} ${p.fullName}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium">{accompanyingCount}</td>
                          <td className="py-3.5 px-4 text-right">{formatCurrency(3500)}</td>
                          <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(accRate)}</td>
                        </tr>
                        <tr className="bg-gray-50/40 text-xs text-gray-600">
                          <td className="py-2 px-4 italic text-right" colSpan={3}>18% GST</td>
                          <td className="py-2 px-4 text-right font-medium text-gray-800">{formatCurrency(accGst)}</td>
                        </tr>
                      </>
                    )}

                    {/* Grand Total Row */}
                    <tr className="bg-teal-50/50 border-t-2 border-teal-600/30 text-base font-bold text-gray-900">
                      <td className="py-4 px-4 text-[#004b63]" colSpan={3}>
                        Grand total (including 18% GST)
                      </td>
                      <td className="py-4 px-4 text-right text-lg text-[#004b63]">
                        {formatCurrency(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Choose Payment Method */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg space-y-4">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Choose Payment Method
              </h4>
              <label className="flex items-center gap-3 p-3.5 bg-white border border-[#004b63] rounded cursor-pointer select-none ring-1 ring-[#004b63]">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Axis Razorpay (PAGE WORLDWIDE)"
                  checked={paymentMethod === 'Axis Razorpay (PAGE WORLDWIDE)'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-[#004b63] border-gray-300 focus:ring-[#004b63]"
                />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Axis Razorpay (PAGE WORLDWIDE)</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Credit/Debit Card, UPI, Netbanking</span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={handleMakePayment}
                disabled={saving}
                className="w-full sm:w-auto bg-[#9e1c2b] hover:bg-[#831422] text-white font-bold px-10 py-3 rounded text-sm tracking-wide transition-all shadow-md focus:outline-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <span>Make Payment</span>
                    <span>({formatCurrency(grandTotal)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2.5 text-sm font-medium"
              >
                Back to Optional Items
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: PAYMENT CONFIRMED / SUCCESS RECEIPT */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="text-center py-8 space-y-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                Payment Successful & Registration Confirmed!
              </h3>
              <p className="text-gray-600 text-sm">
                Thank you, <strong>{attendeeData.title} {attendeeData.fullName}</strong>. Your registration for SPCTT 2026 has been successfully confirmed.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Registration Code:</span>
                <span className="font-bold text-gray-900">{registration?.registration_code || '#REG-1287024'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Category:</span>
                <span className="font-semibold text-gray-900">{registration?.category_name || selectedCat.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-800">{paymentSuccessData?.transactionId || registration?.transaction_id || 'PAY_SUCCESS_TXN'}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold text-[#004b63]">
                <span>Total Paid:</span>
                <span>{formatCurrency(registration?.grand_total || grandTotal)}</span>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/user/invoices"
                className="w-full sm:w-auto bg-[#004b63] hover:bg-[#00384a] text-white font-medium px-6 py-2.5 rounded text-sm transition-all shadow-sm"
              >
                View / Print Invoices & Receipts
              </Link>
              <Link
                to="/user/dashboard"
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2.5 rounded text-sm transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegistrationWizardPage;
