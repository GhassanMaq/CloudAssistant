
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
import {
  signIn,
  signOut,
  getCurrentUser,
  resetPassword,
  confirmResetPassword,
  signUp,
  confirmSignUp
} from '@aws-amplify/auth';
import { generateClient } from '@aws-amplify/api';
import { graphqlOperation } from '@aws-amplify/api-graphql';
import { listConversations } from './graphql/queries';
import LexChat from './lexchat';
import './styles.css';

Amplify.configure(awsmobile);
const client = generateClient();

export default function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [signUpMode, setSignUpMode] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    username: '',
    password: '',
    code: '',
    step: 1
  });
  const [resetMode, setResetMode] = useState(false);
  const [resetData, setResetData] = useState({
    username: '',
    code: '',
    newPassword: ''
  });
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then(u => setUser(u))
      .catch(() => {});
  }, []);

  const handleSignIn = async () => {
    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const user = await signIn({ username, password });
      setUser(user);
    } catch (e) {
      alert(e.message || 'Sign in failed.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleSendResetCode = async () => {
    const username = resetData.username.trim();
    if (!username) return alert('Email is required.');

    try {
      await resetPassword({ username });
      alert('Verification code sent to your email.');
    } catch (err) {
      alert(err.message || 'Error sending code');
    }
  };

  const handleConfirmNewPassword = async () => {
    const { username, code, newPassword } = resetData;
    if (!username || !code || !newPassword) {
      alert('All fields are required.');
      return;
    }

    try {
      await confirmResetPassword({
        username: username.trim(),
        confirmationCode: code,
        newPassword
      });
      alert('Password reset successful. Please sign in.');
      setResetMode(false);
    } catch (err) {
      alert(err.message || 'Error confirming password');
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp({
        username: signUpForm.username.trim(),
        password: signUpForm.password,
        options: {
          userAttributes: {
            email: signUpForm.username.trim()
          }
        }
      });
      alert('Verification code sent.');
      setSignUpForm(f => ({ ...f, step: 2 }));
    } catch (e) {
      alert(e.message || 'Sign-up failed.');
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({
        username: signUpForm.username.trim(),
        confirmationCode: signUpForm.code
      });
      alert('✅ Sign-up successful. You may now sign in.');
      setSignUpMode(false);
    } catch (e) {
      alert(e.message || 'Confirmation failed.');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await client.graphql(graphqlOperation(listConversations));
      setConversations(res.data.listConversations.items);
    } catch (e) {
      console.error(e);
      alert('Failed to load history');
    }
  };

  if (!user) {
    return (
      <div className="container">
        {!resetMode ? (
          <>
            <h2 className="center-text">{signUpMode ? 'Sign Up' : 'Sign In'}</h2>

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={signUpMode ? signUpForm.username : form.username}
              onChange={e =>
                signUpMode
                  ? setSignUpForm(f => ({ ...f, username: e.target.value }))
                  : setForm(f => ({ ...f, username: e.target.value }))
              }
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={signUpMode ? signUpForm.password : form.password}
              onChange={e =>
                signUpMode
                  ? setSignUpForm(f => ({ ...f, password: e.target.value }))
                  : setForm(f => ({ ...f, password: e.target.value }))
              }
            />

            {signUpMode && signUpForm.step === 2 && (
              <input
                className="input"
                placeholder="Verification Code"
                value={signUpForm.code}
                onChange={e =>
                  setSignUpForm(f => ({ ...f, code: e.target.value }))
                }
              />
            )}

            {signUpMode ? (
              signUpForm.step === 1 ? (
                <button className="button" onClick={handleSignUp}>
                  Register
                </button>
              ) : (
                <button className="button" onClick={handleConfirmSignUp}>
                  Confirm Code
                </button>
              )
            ) : (
              <button className="button" onClick={handleSignIn}>
                Sign In
              </button>
            )}

            <p className="center-text">
              <span className="link" onClick={() => setResetMode(true)}>
                Forgot Password?
              </span>
              <br />
              <span
                className="link-alt"
                onClick={() => {
                  setSignUpMode(!signUpMode);
                  setSignUpForm({ username: '', password: '', code: '', step: 1 });
                }}
              >
                {signUpMode ? 'Already have an account? Sign In' : 'New user? Sign Up'}
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="center-text">Reset Password</h2>
            <input
              className="input"
              placeholder="Email"
              value={resetData.username}
              onChange={e => setResetData(d => ({ ...d, username: e.target.value }))}
            />
            <button className="button" onClick={handleSendResetCode}>
              Send Code
            </button>
            <input
              className="input"
              placeholder="Verification Code"
              value={resetData.code}
              onChange={e => setResetData(d => ({ ...d, code: e.target.value }))}
            />
            <input
              className="input"
              type="password"
              placeholder="New Password"
              value={resetData.newPassword}
              onChange={e => setResetData(d => ({ ...d, newPassword: e.target.value }))}
            />
            <button className="button" onClick={handleConfirmNewPassword}>
              Confirm Reset
            </button>
            <p className="center-text">
              <span className="link" onClick={() => setResetMode(false)}>
                Back to Sign In
              </span>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="main">
      <h1 className="center-text">🧠 Cloud Assistant</h1>
      <div className="center-text" style={{ marginBottom: 20 }}>
        <button className="button" onClick={handleSignOut}>Sign Out</button>
        <button className="button secondary" onClick={fetchHistory} style={{ marginTop: 10 }}>
          Load Conversation History
        </button>
      </div>

      <div className="card">
        <LexChat />
      </div>

      <div className="history">
        <h3>🕓 Conversation History</h3>
        {conversations.length === 0 ? (
          <p>No conversation history loaded yet.</p>
        ) : (
          conversations.map((c, i) => (
            <div key={i} className="history-item">
              <div><strong>You:</strong> {c.userMessage}</div>
              <div><strong>Bot:</strong> {c.botResponse}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
