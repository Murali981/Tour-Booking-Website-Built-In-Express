import axios from "axios";
import { showAlert } from "./alerts";

/* eslint-disable */
const stripe = Stripe(
  "pk_test_51Q7cTISFEVzUW9BwdZHgLyR6WOr44geGtrcmDcDDE9cAB3zBhEiLshmQOIsg8qlD4FBD1GmNWLvKtfKOmcCSeo9v0057hr9k5Z",
);

export const bookTour = async (tourId) => {
  try {
    // Step 1: Get the session from the server
    // Here we will use this route "/api/v1/bookings/checkout-session/:tourId" to get the session from the server to the client side.
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    ); // Here we are doing a GET request so there is no need
    // to explicitly specify the method as "GET" here and from here we are getting the session details of user by making an API call
    // to Stripe
    console.log(session);
    // Step 2: Create a checkout Form(We are using our stripe object to basically automatically create a checkout form) + Charge the credit
    // Below stripe object is using the "Stripe" library with our public key above "Stripe(
    //  "pk_test_51Q7cTISFEVzUW9BwdZHgLyR6WOr44geGtrcmDcDDE9cAB3zBhEiLshmQOIsg8qlD4FBD1GmNWLvKtfKOmcCSeo9v0057hr9k5Z",
    // );"
    await stripe.redirectToCheckout({ sessionId: session.data.session.id }); // With this statement we have created a checkout and charged
    // the credit card using stripe.redirectToCheckout method. We are passing the session id in the redirectToCheckout
    //  card.
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
