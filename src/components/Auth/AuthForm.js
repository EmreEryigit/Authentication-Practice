import { useState, useRef, useContext } from 'react';
import AuthContext from '../../store/auth-context';
import { useHistory } from 'react-router-dom';
import classes from './AuthForm.module.css';
const API_KEY = "AIzaSyCs5k61UhkUodjWkzRVgkefNq-w3R1G6qI"
const AuthForm = () => {
  const history = useHistory();
  const ctx = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef("");
  const passwordInputRef = useRef("");
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };
  const submitHandler = (event) => {
    event.preventDefault();
    
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    setIsLoading(true);
    let url;
    if(isLogin) {
      url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY;
    }else {
      url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + API_KEY
    }
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
          email: enteredEmail,
          password: enteredPassword,
          returnSecureToken: true
        }),
        headers: {
          "Content-Type": "application/json"
        }
        
      }).then(res => {
        setIsLoading(false);
        if(res.ok) {
          return res.json();
        }else {
          res.json().then(data => {
            let errorMessage = "Auth Failed"
            if(data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            
            throw new Error(errorMessage);
          })
        }
      }).then(data => {
        const expTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        ctx.login(data.idToken, expTime.toISOString());
        history.replace("/")
      }).catch (e => {
        alert(e.message);
      })
  }

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' required  ref={passwordInputRef}/>
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <button disabled>Loading...</button>}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
