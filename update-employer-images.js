const fs = require('fs');
const path = require('path');

const file = 'c:\\Users\\Aryan\\Desktop\\Param mitra\\jobzz_2025\\frontend\\src\\app\\pannels\\public-user\\components\\home\\index16.jsx';

let content = fs.readFileSync(file, 'utf8');

// Replace the first SVG (Post Your Job)
const postJobSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>`;

const postJobImg = `<img 
														src="https://static.vecteezy.com/system/resources/previews/067/381/647/non_2x/job-posting-announcement-recruitment-hiring-application-candidate-employment-vector.jpg" 
														alt="Post Your Job" 
														style={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															borderRadius: '12px'
														}}
													/>`;

content = content.replace(postJobSvg, postJobImg);

// Replace the second SVG (Hire the Best)
const hireTheBestSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<circle cx="8.5" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M20 8V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M23 11H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>`;

const hireTheBestImg = `<img 
														src="https://i.pinimg.com/736x/57/2e/14/572e1453e353f60c803bd01c4ea68a05.jpg" 
														alt="Hire the Best" 
														style={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															borderRadius: '12px'
														}}
													/>`;

content = content.replace(hireTheBestSvg, hireTheBestImg);

// Replace the third SVG (Build Your Team)
const buildYourTeamSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0414 20.9999 15.5759 20.2 15.3726" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														<path d="M16 3.37006C16.7999 3.57343 17.5033 4.03891 18.0094 4.69526C18.5155 5.3516 18.8 6.16204 18.8 6.99756C18.8 7.83308 18.5155 8.64352 18.0094 9.29987C17.5033 9.95621 16.7999 10.4217 16 10.625" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>`;

const buildYourTeamImg = `<img 
														src="https://i.pinimg.com/736x/c3/10/17/c31017b46cfd17082e7ab29ba1df4f55.jpg" 
														alt="Build Your Team" 
														style={{
															width: '100%',
															height: '100%',
															objectFit: 'cover',
															borderRadius: '12px'
														}}
													/>`;

content = content.replace(buildYourTeamSvg, buildYourTeamImg);

fs.writeFileSync(file, content, 'utf8');

console.log('Successfully updated employer images!');