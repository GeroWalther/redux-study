import { createSlice } from "@reduxjs/toolkit";
// 1. creates action creaters from reducers automatically
// 2. no switch statement, default case handled automatically
// 3. let's us mutate state directly inside reducers

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
      state.isLoading = false;
    },
    withdraw(state, action) {
      state.balance -= action.payload;
    },

    // action.payload is default to 1 variable, not an object - in order to receive more than 1 argument we need to prepare data before it reaches the reducer like here.
    requestLoan: {
      //prepare payload
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
          //this will be the action.payload below in the reducer
        };
      },

      reducer(state, action) {
        if (state.loan > 0) return; // does not need to return anything, just mutate the properties we need.

        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance = state.balance + action.payload.amount;
      },
    },
    payLoan(state) {
      // need to pay attention to the order
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});
export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  //for async functions = thunks are automatically provided in redux toolkit
  return async function (dispatch, getState) {
    // API call
    dispatch({ type: "account/convertingCurrency" });

    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    console.log(data);
    const converted = data.rates.USD;

    // dispatch to the store the final action
    dispatch({ type: "account/deposit", payload: converted });
  };
}

export default accountSlice.reducer;
