import React from "react";

const PasswordStrengthMeter = ({ value }) => {
  const calculateStrength = (password) => {
    let strength = 0;

    // Length
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Common patterns (basic check)
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
    const lowerPass = password.toLowerCase();
    if (!commonPatterns.some(pattern => lowerPass.includes(pattern))) {
      strength += 1;
    }

    return Math.min(strength, 6); // Cap at 6
  };

  const strength = calculateStrength(value);
  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong"
  ];

  const strengthColors = [
    "#EF4444", // red-500
    "#F97316", // orange-500
    "#EAB308", // yellow-500
    "#84CC16", // lime-500
    "#22C55E", // emerald-500
    "#10B981"  // emerald-600
  ];

  const getStrengthLabel = () => {
    if (value.length === 0) return "";
    return strengthLabels[strength - 1] || strengthLabels[0];
  };

  const getBarColor = (index) => {
    if (value.length === 0) return "#E500;
    return index < strength ? strengthColors[index] : "#E5E7EB"; // gray-200
  };

  return (
    <div className="mt-2">
      {value.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#050a1a]/60">
            {getStrengthLabel()}
          </span>
          <div className="w-[120px] h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-[16.66%] bg-${getBarColor(i)} transition-all duration-200`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;