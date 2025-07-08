// App.js for ZEUS
    import React, { useEffect, useState } from 'react';
    import { initializeApp } from 'firebase/app';
    import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
    import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
    import './index.css'; // For Tailwind CSS

    // Define global variables for Firebase configuration provided by the environment
    // These are MANDATORY and will be populated by the Canvas environment.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'zeus-app-id'; // Changed default app ID for ZEUS
    // IMPORTANT: Replace the firebaseConfig object below with your actual configuration from Firebase Console
    const firebaseConfig = {
  apiKey: "AIzaSyAilMIoFj4tQJLRHBmopEh1ykEUsSIKT8Y",
  authDomain: "creative-reviews.firebaseapp.com",
  projectId: "creative-reviews",
  storageBucket: "creative-reviews.firebasestorage.app",
  messagingSenderId: "828438685233",
  appId: "1:828438685233:web:42f8e5aae573fea1165710",
  measurementId: "G-B7J7E9R8H4"
};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Main App Component
    const App = () => {
      // State variables for Firebase instances and user information
      const [app, setApp] = useState(null);
      const [db, setDb] = useState(null);
      const [auth, setAuth] = useState(null);
      const [userId, setUserId] = useState(null);
      const [userEmail, setUserEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isAuthReady, setIsAuthReady] = useState(false);
      const [authMessage, setAuthMessage] = useState('');
      const [businessName, setBusinessName] = useState('');
      const [businessData, setBusinessData] = useState(null);
      const [customers, setCustomers] = useState([]);
      const [newCustomerName, setNewCustomerName] = useState('');
      const [newCustomerEmail, setNewCustomerEmail] = useState('');
      const [newCustomerPhone, setNewCustomerPhone] = useState('');
      const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
      const [showAuthModal, setShowAuthModal] = useState(false);
      const [isRegistering, setIsRegistering] = useState(false);

      // Initialize Firebase and set up authentication listener
      useEffect(() => {
        try {
          // Initialize Firebase app
          const firebaseApp = initializeApp(firebaseConfig);
          setApp(firebaseApp);

          // Get Auth and Firestore instances
          const authInstance = getAuth(firebaseApp);
          const dbInstance = getFirestore(firebaseApp);
          setAuth(authInstance);
          setDb(dbInstance);

          // Set up authentication state listener
          const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
              // User is signed in
              setUserId(user.uid);
              setUserEmail(user.email);
              setAuthMessage(`Logged in as: ${user.email || 'Anonymous'}`);
              // Fetch business data for the logged-in user
              await fetchBusinessData(dbInstance, user.uid);
              // Fetch customers for the logged-in user
              await fetchCustomers(dbInstance, user.uid);
            } else {
              // User is signed out
              setUserId(null);
              setUserEmail('');
              setBusinessData(null);
              setCustomers([]);
              setAuthMessage('Please log in or register.');
            }
            setIsAuthReady(true); // Authentication state is ready
          });

          // Attempt to sign in with custom token if available
          const signInWithToken = async () => {
            if (initialAuthToken && authInstance) {
              try {
                await signInWithCustomToken(authInstance, initialAuthToken);
                setAuthMessage('Signed in with custom token.');
              } catch (error) {
                console.error('Error signing in with custom token:', error);
                // If custom token fails, sign in anonymously as a fallback
                await signInAnonymously(authInstance);
                setAuthMessage('Signed in anonymously (custom token failed or not provided).');
              }
            } else if (authInstance) {
              // If no custom token, sign in anonymously
              signInAnonymously(authInstance).then(() => {
                setAuthMessage('Signed in anonymously.');
              }).catch((error) => {
                console.error('Error signing in anonymously:', error);
                setAuthMessage('Error signing in anonymously.');
              });
            }
          };

          signInWithToken(); // Call the sign-in function

          // Clean up the auth listener on component unmount
          return () => unsubscribe();
        } catch (error) {
          console.error('Error initializing Firebase:', error);
          setAuthMessage('Error initializing Firebase. Check console for details.');
        }
      }, []); // Empty dependency array ensures this runs only once on mount

      // Function to fetch business data from Firestore
      const fetchBusinessData = async (dbInstance, uid) => {
        if (!dbInstance || !uid) return;
        try {
          // Define the path for public data: /artifacts/{appId}/public/data/businesses/{businessId}
          const businessDocRef = doc(dbInstance, `artifacts/${appId}/public/data/businesses`, uid);
          const docSnap = await getDoc(businessDocRef);
          if (docSnap.exists()) {
            setBusinessData(docSnap.data());
            setBusinessName(docSnap.data().name || '');
          } else {
            console.log("No business data found for this user.");
            setBusinessData(null);
            setBusinessName('');
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
        }
      };

      // Function to fetch customers from Firestore
      const fetchCustomers = async (dbInstance, uid) => {
        if (!dbInstance || !uid) return;
        try {
          // Define the path for private data: /artifacts/{appId}/users/{userId}/customers
          const customersCollectionRef = collection(dbInstance, `artifacts/${appId}/users/${uid}/customers`);
          // Use onSnapshot to get real-time updates
          onSnapshot(customersCollectionRef, (snapshot) => {
            const customersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort customers by name for consistent display
            customersList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCustomers(customersList);
          }, (error) => {
            console.error("Error listening to customers:", error);
          });
        } catch (error) {
          console.error("Error fetching customers:", error);
        }
      };

      // Handle user registration
      const handleRegister = async () => {
        if (!auth || !db) {
          setAuthMessage('Firebase not initialized.');
          return;
        }
        if (!userEmail || !password || !businessName) {
          setAuthMessage('Please fill in email, password, and business name.');
          return;
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
          const user = userCredential.user;
          // Store business data in Firestore under the public path
          // This allows other parts of the app (e.g., review link generation) to access business name
          const businessDocRef = doc(db, `artifacts/${appId}/public/data/businesses`, user.uid);
          await setDoc(businessDocRef, {
            name: businessName,
            ownerEmail: user.email,
            createdAt: new Date().toISOString(),
            // Add other business settings here later
          });
          setAuthMessage('Registration successful! You are now logged in.');
          setShowAuthModal(false);
        } catch (error) {
          console.error('Error registering:', error);
          setAuthMessage(`Registration failed: ${error.message}`);
        }
      };

      // Handle user login
      const handleLogin = async () => {
        if (!auth) {
          setAuthMessage('Firebase not initialized.');
          return;
        }
        if (!userEmail || !password) {
          setAuthMessage('Please fill in email and password.');
          return;
        }
        try {
          await signInWithEmailAndPassword(auth, userEmail, password);
          setAuthMessage('Login successful!');
          setShowAuthModal(false);
        } catch (error) {
          console.error('Error logging in:', error);
          setAuthMessage(`Login failed: ${error.message}`);
        }
      };

      // Handle user logout
      const handleLogout = async () => {
        if (auth) {
          try {
            await signOut(auth);
            setAuthMessage('Logged out successfully.');
          } catch (error) {
            console.error('Error logging out:', error);
            setAuthMessage(`Logout failed: ${error.message}`);
          }
        }
      };

      // Add a new customer
      const handleAddCustomer = async () => {
        if (!db || !userId) {
          console.error('Firestore or User ID not available.');
          return;
        }
        if (!newCustomerName || !newCustomerEmail) {
          alert('Customer name and email are required.'); // Using alert for now, will replace with custom modal
          return;
        }

        try {
          // Add customer to the user's private collection
          await addDoc(collection(db, `artifacts/${appId}/users/${userId}/customers`), {
            name: newCustomerName,
            email: newCustomerEmail,
            phone: newCustomerPhone,
            addedAt: new Date().toISOString(),
            // Add other customer details as needed
          });
          setNewCustomerName('');
          setNewCustomerEmail('');
          setNewCustomerPhone('');
          setShowAddCustomerModal(false);
          console.log('Customer added successfully!');
        } catch (error) {
          console.error('Error adding customer:', error);
          alert(`Failed to add customer: ${error.message}`); // Using alert for now
        }
      };

      // Placeholder for sending review request (will be implemented later with Cloud Functions)
      const sendReviewRequest = (customer) => {
        alert(`Sending review request to ${customer.name} (${customer.email})... (Not yet implemented)`);
        // This will trigger a Cloud Function later
      };

      if (!isAuthReady) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="text-center text-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading application...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-100 font-inter">
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md rounded-b-lg">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-3xl font-bold">ReviewFlow</h1> {/* Changed title to ReviewFlow for consistency */}
              <div className="flex items-center space-x-4">
                {userId ? (
                  <>
                    <span className="text-sm">Welcome, {userEmail || 'User'}!</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-gray-100 transition duration-300 ease-in-out"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Auth Modal */}
          {showAuthModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                  {isRegistering ? 'Register Your Business' : 'Login'}
                </h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isRegistering && (
                  <input
                    type="text"
                    placeholder="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <button
                  onClick={isRegistering ? handleRegister : handleLogin}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                >
                  {isRegistering ? 'Register' : 'Login'}
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {isRegistering ? 'Login here' : 'Register here'}
                  </button>
                </p>
                {authMessage && (
                  <p className="text-red-500 text-center mt-4 text-sm">{authMessage}</p>
                )}
                 <button
                  onClick={() => setShowAuthModal(false)}
                  className="mt-6 w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 ease-in-out shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="container mx-auto p-6">
            {userId ? (
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  {businessData ? `${businessData.name}'s Dashboard` : 'Your Dashboard'}
                </h2>
                <p className="text-gray-600 mb-8">
                  User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-sm">{userId}</span>
                </p>

                {/* Add Customer Section */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Manage Customers</h3>
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out shadow-md"
                  >
                    Add New Customer
                  </button>

                  {/* Add Customer Modal */}
                  {showAddCustomerModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add New Customer</h2>
                        <input
                          type="text"
                          placeholder="Customer Name"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Customer Email"
                          value={newCustomerEmail}
                          onChange={(e) => setNewCustomerEmail(e.target.value)}
                          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="tel"
                          placeholder="Customer Phone (Optional)"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleAddCustomer}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                        >
                          Add Customer
                        </button>
                        <button
                          onClick={() => setShowAddCustomerModal(false)}
                          className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 ease-in-out shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customers List */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Customers ({customers.length})</h3>
                  {customers.length === 0 ? (
                    <p className="text-gray-500">No customers added yet. Add one above!</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Name</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 whitespace-nowrap text-gray-800">{customer.name}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-gray-800">{customer.email}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-gray-800">{customer.phone || 'N/A'}</td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <button
                                  onClick={() => sendReviewRequest(customer)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition duration-300 ease-in-out shadow-sm"
                                >
                                  Send Review Request
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Placeholder for future sections */}
                <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-200 shadow-inner">
                  <h3 className="text-2xl font-semibold text-blue-800 mb-4">Upcoming Features:</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-2">
                    <li>Automated CRM Integrations (Square, Jobber, Zapier) via Webhooks</li>
                    <li>Customizable SMS & Email Templates</li>
                    <li>Follow-up Message Scheduling</li>
                    <li>Google Place ID Lookup for Review Links</li>
                    <li>Tracking Sent Requests & Analytics</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to ReviewFlow!</h2>
                <p className="text-gray-600 mb-6">
                  Your ultimate solution for automated Google Review requests.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
                >
                  Get Started - Login or Register
                </button>
                {authMessage && (
                  <p className="text-red-500 text-center mt-6 text-sm">{authMessage}</p>
                )}
              </div>
            )}
          </main>
        </div>
      );
    };

    export default App;
    