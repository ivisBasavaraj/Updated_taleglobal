const holidaysService = require('./utils/holidaysService');

async function testHolidays() {
  console.log('Testing Holidays API Integration...\n');

  try {
    // Test 1: Get holidays for current year
    console.log('1. Fetching holidays for 2024...');
    const holidays2024 = await holidaysService.getHolidays(2024);
    console.log(`Found ${holidays2024.length} holidays for 2024`);
    console.log('First 3 holidays:', holidays2024.slice(0, 3));

    // Test 2: Check if a specific date is a holiday
    console.log('\n2. Checking if 2024-01-26 (Republic Day) is a holiday...');
    const isRepublicDay = await holidaysService.isHoliday('2024-01-26');
    console.log('Is holiday:', isRepublicDay);

    // Test 3: Get holiday info for a specific date
    console.log('\n3. Getting holiday info for 2024-01-26...');
    const republicDayInfo = await holidaysService.getHolidayInfo('2024-01-26');
    console.log('Holiday info:', republicDayInfo);

    // Test 4: Check a non-holiday date
    console.log('\n4. Checking if 2024-01-15 is a holiday...');
    const isNormalDay = await holidaysService.isHoliday('2024-01-15');
    console.log('Is holiday:', isNormalDay);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHolidays();