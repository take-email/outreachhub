import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";

const PIN_STORAGE_KEY = "founderreach_pin";
const AUTH_STORAGE_KEY = "founderreach_authenticated";

export const PinProtection = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    
    if (!storedPin) {
      setIsSettingPin(true);
    } else if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSetPin = () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
    setError("");
  };

  const handleLogin = () => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (pin === storedPin) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isSettingPin) {
        handleSetPin();
      } else {
        handleLogin();
      }
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">FounderReach</h1>
            <p className="text-slate-500 mt-1">
              {isSettingPin ? "Set up your PIN to secure the app" : "Enter your PIN to continue"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSettingPin ? "Create PIN" : "Enter PIN"}
                className="h-12 text-center text-lg tracking-widest pr-10"
                data-testid="pin-input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSettingPin && (
              <Input
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm PIN"
                className="h-12 text-center text-lg tracking-widest"
                data-testid="confirm-pin-input"
              />
            )}

            {error && (
              <p className="text-red-500 text-sm text-center" data-testid="pin-error">
                {error}
              </p>
            )}

            <Button
              onClick={isSettingPin ? handleSetPin : handleLogin}
              className="w-full h-12 bg-violet-700 hover:bg-violet-800 text-lg"
              data-testid="pin-submit-btn"
            >
              {isSettingPin ? "Set PIN" : "Unlock"}
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            {isSettingPin 
              ? "This PIN will be required every time you open the app" 
              : "PIN is stored locally on this device"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinProtection;
