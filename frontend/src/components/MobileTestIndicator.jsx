import React, { useState, useEffect } from 'react';

const MobileTestIndicator = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getDeviceType = () => {
        if (screenSize.width <= 480) return 'Extra Small Mobile';
        if (screenSize.width <= 575) return 'Small Mobile';
        if (screenSize.width <= 767) return 'Mobile';
        if (screenSize.width <= 991) return 'Tablet';
        if (screenSize.width <= 1199) return 'Desktop';
        return 'Large Desktop';
    };

    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace'
        }}>
            <div>{getDeviceType()}</div>
            <div>{screenSize.width} x {screenSize.height}</div>
        </div>
    );
};

export default MobileTestIndicator;