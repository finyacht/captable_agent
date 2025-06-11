<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cap Table Knowledge Agent</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            height: 90vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
        }

        .message {
            margin-bottom: 20px;
            padding: 15px 20px;
            border-radius: 15px;
            max-width: 80%;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .user-message {
            background: #4f46e5;
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 5px;
        }

        .agent-message {
            background: white;
            color: #1f2937;
            border: 1px solid #e5e7eb;
            margin-right: auto;
            border-bottom-left-radius: 5px;
        }

        .input-container {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            background: white;
        }

        .input-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        #messageInput {
            flex: 1;
            padding: 15px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.2s;
        }

        #messageInput:focus {
            border-color: #4f46e5;
        }

        #sendButton {
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        #sendButton:hover {
            background: #4338ca;
        }

        #sendButton:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .loading {
            display: none;
            padding: 15px 20px;
            margin-bottom: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 15px;
            max-width: 80%;
            margin-right: auto;
            border-bottom-left-radius: 5px;
        }

        .loading-dots {
            display: flex;
            gap: 4px;
        }

        .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4f46e5;
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
            0%, 80%, 100% {
                transform: scale(0);
            } 40% {
                transform: scale(1);
            }
        }

        .api-setup {
            background: #fef3c7;
            padding: 15px;
            margin: 20px;
            border-radius: 10px;
            border-left: 4px solid #f59e0b;
        }

        .api-input {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
        }

        .setup-button {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }

        .quick-questions {
            padding: 0 20px 20px;
            background: #f8fafc;
        }

        .quick-questions h3 {
            margin-bottom: 10px;
            color: #1f2937;
        }

        .question-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .question-chip {
            background: white;
            border: 1px solid #d1d5db;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }

        .question-chip:hover {
            background: #4f46e5;
            color: white;
            border-color: #4f46e5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Cap Table Assistant</h1>
            <p>Your AI-powered guide to cap table management</p>
        </div>

        <div id="apiSetup" class="api-setup">
            <strong>⚙️ Setup Required:</strong> Enter your Groq API key and backend URL:
            <br><small>Get free Groq key at: <a href="https://console.groq.com" target="_blank">console.groq.com</a></small>
            <input type="text" id="backendUrl" class="api-input" placeholder="Your Vercel backend URL (e.g., https://yourapp.vercel.app)" style="margin-bottom: 10px;">
            <input type="password" id="apiKeyInput" class="api-input" placeholder="Enter your Groq API key here...">
            <button onclick="saveApiKey()" class="setup-button">Save & Start</button>
        </div>

        <div class="chat-container">
            <div class="messages" id="messages">
                <div class="message agent-message">
                    <strong>👋 Hello!</strong> I'm your Cap Table Assistant. I can help you understand:
                    <br><br>
                    • Equity dilution and ownership calculations<br>
                    • Different share types (common, preferred, options)<br>
                    • Valuation impacts on cap tables<br>
                    • Platform features and workflows<br>
                    <br>
                    What would you like to know?
                </div>
            </div>

            <div class="quick-questions">
                <h3>Quick Questions:</h3>
                <div class="question-chips">
                    <div class="question-chip" onclick="askQuestion('How does equity dilution work?')">How does equity dilution work?</div>
                    <div class="question-chip" onclick="askQuestion('What are preferred shares?')">What are preferred shares?</div>
                    <div class="question-chip" onclick="askQuestion('How do stock options affect cap tables?')">How do stock options work?</div>
                    <div class="question-chip" onclick="askQuestion('What is pre-money vs post-money valuation?')">Pre vs post-money valuation?</div>
                </div>
            </div>

            <div class="loading" id="loading">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <span style="margin-left: 10px;">Thinking...</span>
            </div>

            <div class="input-container">
                <div class="input-group">
                    <input type="text" id="messageInput" placeholder="Ask me anything about cap tables..." disabled>
                    <button id="sendButton" onclick="sendMessage()" disabled>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let apiKey = '';
        let backendUrl = '';
        
        // Knowledge base - UPDATE THIS WITH YOUR PLATFORM INFO
        const knowledgeBase = `
        PLATFORM: Cap Table Management Platform
        
        CORE FEATURES:
        - Real-time cap table modeling and scenario planning
        - Automated dilution calculations across funding rounds
        - Employee equity management with vesting schedules
        - Investor reporting and compliance tracking
        - 409A valuation integration and tracking
        
        CAP TABLE FUNDAMENTALS:
        
        Equity Dilution: When new shares are issued, existing shareholders' ownership percentages decrease proportionally. For example, if you own 10% of a company with 1M shares, and the company issues 500K new shares, your ownership drops to 6.67% (100K shares out of 1.5M total).
        
        Common vs Preferred Shares:
        - Common shares: Basic ownership stakes, typically held by founders and employees
        - Preferred shares: Usually issued to investors with special rights like liquidation preferences, anti-dilution protection, and board seats
        
        Stock Options: Rights to purchase shares at a fixed price (strike price). They vest over time, typically 4 years with a 1-year cliff. Options dilute existing shareholders when exercised.
        
        Pre-money vs Post-money Valuation:
        - Pre-money: Company valuation before new investment
        - Post-money: Company valuation after new investment (pre-money + investment amount)
        
        Liquidation Preferences: Preferred shareholders get paid first in exit scenarios, often 1x their investment before common shareholders see anything.
        
        COMMON QUESTIONS:
        
        Q: How do I calculate dilution from a new funding round?
        A: Dilution = New shares issued / (Existing shares + New shares). Use our scenario modeling tool to run different investment amounts and see the impact on all stakeholders.
        
        Q: What happens to employee options during funding rounds?
        A: Options typically get diluted like other shares, but companies often increase the option pool before funding rounds to maintain employee incentives.
        
        Q: How often should we update our cap table?
        A: Update immediately after any equity event: new hires receiving options, option exercises, funding rounds, or share transfers. Our platform syncs automatically with these events.
        
        PLATFORM SPECIFIC:
        - Automated compliance reports for investors
        - Integration with payroll systems for option grants
        - Mobile app for stakeholders to track their equity
        - Scenario planning tools for different exit valuations
        `;

        function saveApiKey() {
            const key = document.getElementById('apiKeyInput').value.trim();
            const backend = document.getElementById('backendUrl').value.trim();
            if (key && backend) {
                apiKey = key;
                backendUrl = backend;
                document.getElementById('apiSetup').style.display = 'none';
                document.getElementById('messageInput').disabled = false;
                document.getElementById('sendButton').disabled = false;
                document.getElementById('messageInput').focus();
            } else {
                alert('Please enter both your API key and backend URL');
            }
        }

        function askQuestion(question) {
            if (!apiKey) {
                alert('Please set up your API key first');
                return;
            }
            document.getElementById('messageInput').value = question;
            sendMessage();
        }

        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message || !apiKey) return;
            
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('sendButton').disabled = true;
            
            try {
                const response = await fetch(`${backendUrl}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        apiKey: apiKey,
                        messages: [
                            {
                                role: 'system',
                                content: `You are a helpful cap table and equity management expert. Use this knowledge base to answer questions accurately and helpfully. Always be specific and provide practical examples when possible. Here's your knowledge base:\n\n${knowledgeBase}`
                            },
                            {
                                role: 'user',
                                content: message
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.choices && data.choices[0]) {
                    addMessage(data.choices[0].message.content, 'agent');
                } else {
                    console.error('API Response:', data);
                    addMessage('Sorry, I got an unexpected response. Please try again.', 'agent');
                }
                
            } catch (error) {
                console.error('Detailed Error:', error);
                let errorMessage = 'Sorry, I encountered an error. ';
                
                if (error.message.includes('401')) {
                    errorMessage += 'Your API key appears to be invalid. Please check and try again.';
                } else if (error.message.includes('429')) {
                    errorMessage += 'API rate limit reached. Please wait a moment and try again.';
                } else if (error.message.includes('Backend Error')) {
                    errorMessage += 'Backend connection issue. Please check your backend URL.';
                } else {
                    errorMessage += `Error details: ${error.message}`;
                }
                
                addMessage(errorMessage, 'agent');
            }
            
            // Hide loading
            document.getElementById('loading').style.display = 'none';
            document.getElementById('sendButton').disabled = false;
        }

        function addMessage(text, sender) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.innerHTML = text.replace(/\n/g, '<br>');
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Enter key to send message
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // API key input enter key
        document.getElementById('apiKeyInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveApiKey();
            }
        });
    </script>
</body>
</html>