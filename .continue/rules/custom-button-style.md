---
description: Overrides default button styles with a thin orange border, light
  orange background, and solid orange text.
alwaysApply: true
---

button,
.btn,
.site-button,
.ant-btn {
  font-weight: 600 !important;
  background-color: rgba(255, 122, 0, 0.08) !important; /* Light translucent orange */
  color: #FF7A00 !important;
  border: thin solid #FF7A00 !important;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  display: flex !important; /* For vertical centering */
  align-items: center !important; /* For vertical centering */
  justify-content: center !important; /* For horizontal centering */
}

button:hover,
.btn:hover,
.site-button:hover,
.ant-btn:hover {
  background-color: rgba(255, 122, 0, 0.16) !important; /* Slightly darker translucent orange */
  color: #FF7A00 !important;
  border-color: #FF7A00 !important;
}

button:active,
.btn:active,
.site-button:active,
.ant-btn:active {
  background-color: rgba(255, 122, 0, 0.24) !important; /* Even darker translucent orange */
  color: #FF7A00 !important;
  border-color: #FF7A00 !important;
}