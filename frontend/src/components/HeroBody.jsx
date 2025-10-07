import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBody.css';
import { FaBriefcase, FaCalculator, FaCode, FaUsers } from 'react-icons/fa';

const HeroBody = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    what: '',
    type: '',
    location: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locations = [
    'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Allahabad', 'Amritsar', 'Aurangabad', 'Bangalore', 'Bareilly', 'Belgaum',
    'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bilaspur', 'Chandigarh', 'Chennai', 'Coimbatore', 'Cuttack', 'Dehradun', 'Delhi',
    'Dhanbad', 'Durgapur', 'Erode', 'Faridabad', 'Firozabad', 'Ghaziabad', 'Gorakhpur', 'Gulbarga', 'Guntur', 'Gurgaon',
    'Guwahati', 'Gwalior', 'Hubli', 'Hyderabad', 'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamnagar',
    'Jamshedpur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolhapur', 'Kolkata', 'Kota', 'Kozhikode', 'Kurnool', 'Lucknow',
    'Ludhiana', 'Madurai', 'Mangalore', 'Meerut', 'Moradabad', 'Mumbai', 'Mysore', 'Nagpur', 'Nashik', 'Nellore',
    'New Delhi', 'Noida', 'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Salem', 'Sangli',
    'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur',
    'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Remote', 'Work From Home'
  ];

  const handleLocationChange = (value) => {
    setSearchData({...searchData, location: value});
    if (value.length > 0) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setSearchData({...searchData, location});
    setShowSuggestions(false);
  };

  const jobCategories = [
    { icon: FaCode, name: 'IT' },
    { icon: FaBriefcase, name: 'Sales' },
    { icon: FaUsers, name: 'Marketing' },
    { icon: FaCalculator, name: 'Finance' },
    { icon: FaUsers, name: 'HR' },
    { icon: FaBriefcase, name: 'Operations' },
    { icon: FaCode, name: 'Design' }
  ];

  const handleSearch = () => {
    const filters = {};
    if (searchData.what && searchData.what !== '') filters.search = searchData.what;
    if (searchData.type && searchData.type !== '') filters.jobType = searchData.type;
    if (searchData.location && searchData.location !== '') filters.location = searchData.location;
    
    console.log('Search filters:', filters);
    
    // Navigate to job grid page with filters
    const queryString = Object.keys(filters)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
      .join('&');
    
    navigate(`/job-grid${queryString ? '?' + queryString : ''}`);
  };

  return (
    <div className="hero-body">
      {/* Hero Section */}
      <div className="hero-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '0.5rem' }}>
          <div className="hero-text" style={{ flex: 1, textAlign: 'left' }}>
            <h1 className="hero-title">
              Find the <span className="highlight">job</span> that fits<br />
              your life
            </h1>
            <p className="hero-subtitle" style={{ color: '#ff9c00' }}>
              Type your keyword, then click search to find your perfect job.
            </p>
            <button 
              onClick={() => navigate('/job-grid')}
              style={{
                background: '#ff9c00',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem',
                marginBottom: '1rem'
              }}
            >
              Explore Jobs
            </button>
            
            {/* Search Bar */}
            <div className="search-container" style={{ marginLeft: '0', maxWidth: '600px', marginTop: '1rem' }}>
              <div className="search-field">
                <label className="search-label">WHAT</label>
                <select 
                  className="search-select"
                  value={searchData.what}
                  onChange={(e) => setSearchData({...searchData, what: e.target.value})}
                >
                  <option value="">Job Title</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>
              
              <div className="search-field">
                <label className="search-label">TYPE</label>
                <select 
                  className="search-select"
                  value={searchData.type}
                  onChange={(e) => setSearchData({...searchData, type: e.target.value})}
                  style={{ minWidth: '140px' }}
                >
                  <option value="">All Category</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Remote">Remote</option>
                  <option value="Work From Home">Work From Home</option>
                </select>
              </div>
              
              <div className="search-field location-field">
                <label className="search-label">LOCATION</label>
                <div className="location-input">
                  <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    className="search-select location-select"
                    value={searchData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => searchData.location && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search location..."
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="location-suggestions">
                      {locationSuggestions.map((location, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => selectLocation(location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button className="search-btn" onClick={handleSearch}>
                Find Job
              </button>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <img 
              src="/assets/images/Resume-amico.svg" 
              alt="Find Job" 
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '500px', marginLeft: '2rem' }}
            />
          </div>
        </div>


        {/* Job Categories */}
        <div className="categories-container" style={{overflow: 'hidden', width: '100%'}}>
          <div className="categories-scroll" style={{
            display: 'flex',
            animation: 'scroll 15s linear infinite',
            width: 'calc(200% + 20px)'
          }}>
            {[...jobCategories, ...jobCategories].map((category, index) => (
              <div key={index} className="category-card" style={{minWidth: '140px', flex: 'none'}}>
                <div className="category-icon small">
                  {category.icon ? <category.icon size={16} /> : null}
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBody;