import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { Provider } from "react-redux";
import rootReducer from "./reducers";

const store = createStore(rootReducer, composeWithDevTools());

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>
);
