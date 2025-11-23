"use client";

import { useReducer } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";

interface SignupFormProps {
  onSuccess?: () => void;
}

// Define the state interface
interface State {
  username: string;
  email: string;
  password: string;
  role: string;
  tenantId: string;
  animalExpertise: string[];
  message: string;
  isLoading: boolean;
}

// Define action types
type Action =
  | { type: "SET_FIELD"; field: keyof State; value: any }
  | { type: "TOGGLE_ANIMAL_EXPERTISE"; animal: string }
  | { type: "SET_MESSAGE"; message: string }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "RESET" };

// Initial state
const initialState: State = {
  username: "",
  email: "",
  password: "",
  role: "petOwner",
  tenantId: "",
  animalExpertise: [],
  message: "",
  isLoading: false,
};

// Reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_ANIMAL_EXPERTISE":
      const isSelected = state.animalExpertise.includes(action.animal);
      return {
        ...state,
        animalExpertise: isSelected
          ? state.animalExpertise.filter((a) => a !== action.animal)
          : [...state.animalExpertise, action.animal],
      };
    case "SET_MESSAGE":
      return { ...state, message: action.message };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const ANIMAL_OPTIONS = ["Dog", "Cat", "Bird", "Reptile", "Small Mammal", "Cattle", "Horse", "others"];

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { username, email, password, role, tenantId, animalExpertise, message, isLoading } = state;

  const handleSignup = async () => {
    dispatch({ type: "SET_MESSAGE", message: "" });

    if (!username || !email || !password) {
      dispatch({ type: "SET_MESSAGE", message: "❌ Please fill in all fields" });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      dispatch({ type: "SET_MESSAGE", message: "❌ Please enter a valid email address" });
      return;
    }

    if (password.length < 6) {
      dispatch({ type: "SET_MESSAGE", message: "❌ Password must be at least 6 characters long" });
      return;
    }

    if (role === "vet" && animalExpertise.length === 0) {
      dispatch({ type: "SET_MESSAGE", message: "❌ Please select at least one animal expertise" });
      return;
    }

    dispatch({ type: "SET_LOADING", isLoading: true });

    try {
      const res = await axios.post("/api/Auth/signup", { username, email, password, role, tenantId, animalExpertise });
      dispatch({ type: "SET_MESSAGE", message: "✅ Signup successful! Please login." });
      if (onSuccess) onSuccess();
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      dispatch({ type: "SET_MESSAGE", message: `❌ ${err.response?.data?.error || "An error occurred. Please try again."}` });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-10 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
        Create Account
      </h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full mb-4 p-3 rounded-lg bg-amber-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={username}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 rounded-lg bg-amber-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={email}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 p-3 rounded-lg bg-amber-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={password}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
      />

      {/* Role selector */}
      <select
        className="w-full mb-4 p-3 rounded-lg bg-amber-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={role}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "role", value: e.target.value })}
      >
        <option value="petOwner">Pet Owner</option>
        <option value="vet">Veterinarian</option>
        {/* ⚠️ Don’t expose "admin" here unless it’s invite-only */}
      </select>

      {/* Animal Expertise Selection for Vets */}
      {role === "vet" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Animal Expertise
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ANIMAL_OPTIONS.map((animal) => (
              <button
                key={animal}
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_ANIMAL_EXPERTISE", animal })}
                className={`p-2 text-sm rounded-lg border transition-colors ${animalExpertise.includes(animal)
                  ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-100"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  }`}
              >
                {animal}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tenant field (optional) */}
      <input
        type="text"
        placeholder="Tenant ID (leave empty to create new)"
        className="w-full mb-6 p-3 rounded-lg bg-amber-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={tenantId}
        onChange={(e) => dispatch({ type: "SET_FIELD", field: "tenantId", value: e.target.value })}
      />

      <Button
        onClick={handleSignup}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing Up..." : "Sign Up"}
      </Button>

      {message && (
        <motion.p
          className="mt-4 text-center text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
