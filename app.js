const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOTE5MTU5ZGItMDY4NS00MzhkLWFiYmItNzhmMmI4MTBkZjQ3IiwidHlwZSI6ImFwaV90b2tlbiJ9.xiZFqhP-jlJVClXw07qOFZPYb8AfF-7WT6brYzwdGu8';

// Load the broker stats data from the JSON file
let brokerStats = [];
let classStats = [];

const loadBrokerStatsData = async () => {
    try {
        const brokerResponse = await fetch('broker_stats.json');
        const classResponse = await fetch('class_stats.json');

        brokerStats = await brokerResponse.json();
        classStats = await classResponse.json();

        console.log(brokerStats);
        console.log(classStats);

        // Populate the year select dropdown
        populateYearSelect();

        // Initial population of the dashboard
        const initialYear = '2021';
        populateDashboard(initialYear);
    } catch (error) {
        console.error('Error loading data:', error);
    }
};


const populateYearSelect = () => {
    const yearSelect = document.getElementById('yearSelect');
    const uniqueYears = [...new Set(brokerStats.map(broker => broker.Year))];

    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    yearSelect.addEventListener('change', () => {
        const selectedYear = yearSelect.value;
        populateDashboard(selectedYear);
    });
};

const calculateDiffPercentage = (actual, planned) => {
    const diff = actual - planned;
    return ((diff / planned) * 100).toFixed(2);
};

const populateBrokersTable = (year, marketType) => {
    const tableBody = document.getElementById('brokersTableBody');
    tableBody.innerHTML = '';

    const filteredBrokers = brokerStats.filter(
        (broker) => broker.Year === parseInt(year, 10) && broker['Market Type'] === marketType
    );
    const sortedBrokers = filteredBrokers.sort((a, b) => b.GWP - a.GWP).slice(0, 10);

    sortedBrokers.forEach((broker) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${broker['Broker Name']}</td>
            <td>${broker.GWP.toFixed(2)}</td>
            <td>${broker['Planned GWP'].toFixed(2)}</td>
            <td>${calculateDiffPercentage(broker.GWP, broker['Planned GWP'])}%</td>
        `;
        tableBody.appendChild(row);
    });
};

let brokersChart;  // Declare a variable to store the brokers chart instance

const createBrokersChart = (year, marketType) => {
    const filteredBrokers = brokerStats.filter(
        (broker) => broker.Year === parseInt(year, 10) && broker['Market Type'] === marketType
    );

    const sortedBrokers = filteredBrokers.sort((a, b) => b.GWP - a.GWP).slice(0, 10);

    const brokerNames = sortedBrokers.map((broker) => broker['Broker Name']);
    const gwpData = sortedBrokers.map((broker) => broker.GWP);
    const plannedGwpData = sortedBrokers.map((broker) => broker['Planned GWP']);

    // Clear the existing chart if it exists
    if (brokersChart) {
        brokersChart.destroy();
    }

    const ctx = document.getElementById('brokersChart').getContext('2d');
    brokersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brokerNames,
            datasets: [
                {
                    label: 'GWP',
                    data: gwpData,
                    backgroundColor: '#5470c6', // Blue color
                },
                {
                    label: 'Planned GWP',
                    data: plannedGwpData,
                    backgroundColor: '#91cc75', // Green color
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
};


const populateClassTable = (year, classOfBusiness) => {
    const tableBody = document.getElementById('classTableBody');
    tableBody.innerHTML = '';

    const filteredClasses = classStats.filter(
        (cls) => cls.Year === parseInt(year, 10) && cls['Class of Business'] === classOfBusiness
    );

    filteredClasses.forEach((cls) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cls['Class of Business']}</td>
            <td>${cls.ClassType}</td>
            <td>${cls['Business Plan'].toFixed(2)}</td>
            <td>${cls['Earned Premium'].toFixed(2)}</td>
            <td>${cls['GWP '].toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
};

const createClassChart = (year, classOfBusiness) => {
    const filteredClasses = classStats.filter(
        (cls) => cls.Year === parseInt(year, 10) && cls['Class of Business'] === classOfBusiness
    );

    const classTypes = filteredClasses.map((cls) => cls.ClassType);
    const businessPlanData = filteredClasses.map((cls) => cls['Business Plan']);
    const earnedPremiumData = filteredClasses.map((cls) => cls['Earned Premium']);
    const gwpData = filteredClasses.map((cls) => cls['GWP ']);

    const ctx = document.getElementById('classChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classTypes,
            datasets: [
                {
                    label: 'Business Plan',
                    data: businessPlanData,
                    backgroundColor: '#5470c6', // Blue color
                },
                {
                    label: 'Earned Premium',
                    data: earnedPremiumData,
                    backgroundColor: '#fac858', // Yellow color
                },
                {
                    label: 'GWP',
                    data: gwpData,
                    backgroundColor: '#91cc75', // Green color
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
};

const populateDashboard = (selectedYear) => {
    const marketType = 'Open Market'; // Update with desired market type
    const classOfBusiness = 'Financial Institution'; // Update with desired class of business

    populateBrokersTable(selectedYear, marketType);
    createBrokersChart(selectedYear, marketType);
    populateClassTable(selectedYear, classOfBusiness);
    createClassChart(selectedYear, classOfBusiness);
};

const sendMessage = () => {
    const userMessage = document.getElementById('userMessage').value;
    if (userMessage.trim() !== '') {
        // Send user message to OpenAI API
        sendToOpenAI(userMessage);

        // Clear the input field
        document.getElementById('userMessage').value = '';
    }
};

const updateChat = (userMessage, botResponse) => {
    console.log('Updating chat...');  // Add this line

    const chatMessages = document.querySelector('.chat-messages');

    // Add user message to the chat
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message');
    userMessageElement.textContent = userMessage;
    chatMessages.appendChild(userMessageElement);

    // Add bot response to the chat
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('chat-message');
    botMessageElement.textContent = botResponse;
    chatMessages.appendChild(botMessageElement);
};


loadBrokerStatsData();