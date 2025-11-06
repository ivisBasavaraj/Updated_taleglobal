import { useState, useEffect } from "react";

function SectionEmployerSidebar({ onFilterChange }) {
    const [industries, setIndustries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [teamSizes, setTeamSizes] = useState([]);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        industry: '',
        teamSize: ''
    });

    useEffect(() => {
        fetchEmployerData();
    }, []);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const fetchEmployerData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/employers');
            const data = await response.json();
            if (data.success) {
                const industrySet = new Set();
                const locationSet = new Set();
                const teamSizeSet = new Set();

                data.employers.forEach(emp => {
                    if (emp.profile?.industry) industrySet.add(emp.profile.industry);
                    if (emp.profile?.corporateAddress) locationSet.add(emp.profile.corporateAddress);
                    if (emp.profile?.teamSize) teamSizeSet.add(emp.profile.teamSize);
                });

                setIndustries(Array.from(industrySet).sort());
                setLocations(Array.from(locationSet).sort());
                setTeamSizes(Array.from(teamSizeSet).sort());
            }
        } catch (error) {
            console.error('Error fetching employer data:', error);
        }
    };

    return (
        <div className="side-bar">
            <div className="sidebar-elements search-bx">
                <form>
                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Company Name</h4>
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search company" 
                                value={filters.keyword}
                                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                            />
                            <button className="btn" type="button"><i className="feather-search" /></button>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Location</h4>
                        <select 
                            className="form-control"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Industry</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="radio" 
                                        className="form-check-input" 
                                        id="allIndustry"
                                        name="industry"
                                        value=""
                                        checked={filters.industry === ''}
                                        onChange={(e) => setFilters({...filters, industry: e.target.value})}
                                    />
                                    <label className="form-check-label" htmlFor="allIndustry">All Industries</label>
                                </div>
                            </li>
                            {industries.map((industry, index) => (
                                <li key={industry}>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id={`industry${index}`}
                                            name="industry"
                                            value={industry}
                                            checked={filters.industry === industry}
                                            onChange={(e) => setFilters({...filters, industry: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor={`industry${index}`}>
                                            {industry}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Team Size</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="radio" 
                                        className="form-check-input" 
                                        id="allTeamSize"
                                        name="teamSize"
                                        value=""
                                        checked={filters.teamSize === ''}
                                        onChange={(e) => setFilters({...filters, teamSize: e.target.value})}
                                    />
                                    <label className="form-check-label" htmlFor="allTeamSize">All Sizes</label>
                                </div>
                            </li>
                            {teamSizes.map((size, index) => (
                                <li key={size}>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id={`teamSize${index}`}
                                            name="teamSize"
                                            value={size}
                                            checked={filters.teamSize === size}
                                            onChange={(e) => setFilters({...filters, teamSize: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor={`teamSize${index}`}>
                                            {size}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="form-group mt-4">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm w-100"
                            onClick={() => setFilters({
                                keyword: '',
                                location: '',
                                industry: '',
                                teamSize: ''
                            })}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SectionEmployerSidebar;
