const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Step 1 : We have to find the tour in our database that the client wants to buy (or) book
  const tour = await Tour.findById(req.params.tourId);
  // Step 2: Create the checkout session
  const session = await stripe.checkout.sessions.create({
    // We are storing a bunch of details about the tour in this session
    // This create will basically returns a promise , so we are writing await keyword
    payment_method_types: ["card"], // Here the card is for credit card as a payment method
    mode: "payment",
    // success_url: `${req.protocol}://${req.get("host")}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, // This the url that is getting called once the credit card payment is successful which means the user will be
    // redirected to this url.
    /* We will be creating  a new booking document in our database whenever a user successfully purchases a tour. Remember we had
    the above success_url and this success_url is the basis functionality that we are going to implement here. So whenever a checkout
    is successful then the browser will automatically go to the above url which is the success_url which is our homepage. Exactly at
    this point of time whenever a checkout is successful , we want to create a new booking in our database. Basically we want to
    create a new booking whenever the above success_url is accessed. Now we could create a new tour for this success but then we have
    to create a whole new page and this is not worthy in this case and the reason is we will implement a temporary solution because
    it is not really secure. Whenever a website is actually deployed on a server then we will get access to the session object once
    the purchase is completed using the Stripe Webhooks and these webhooks will be perfect for us to create a new booking. But for
    now we can't do that yet let us use a work around which is to simply put the data that we need to create a new booking right
    into the above success_url as a query string. We need to create a query string because Stripe will make a GET request to the 
    above success_url. So we cannot really send any body (or) any data with it except for the query string. We need three main
    required fields in our Booking model which is tour,user and the price. So the query string will look like this 
     `?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}` and now this route along with the query string is not secure at
     all because right now anyone knows this URL structure here could simply call without going through the Stripe checkout process. So
     anyone can book a tour without having to pay as all they have to do is to open the above URL along with the query string which 
     contains the tour,user and the price and then they would automatically create a new booking in our database without even paying */
    success_url: `${req.protocol}://${req.get("host")}/my-tours`, // We still want to come back to "/my-tours" but without all the above
    // query parameters which are in the above commented success_url. Once this success_url has successfully called after the Stripe
    // checkout has been successful then the "exports.webhookCheckout" function will be called.
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`, // This is the url that is getting called once the credit card
    // payment is unsuccessful (or) the user cancels the payment then he/she will be redirected to this url.
    customer_email: req.user.email, // As this is a protected route the user email is already on the req.user and we are prefilling the
    // user email here whenever he is purchasing a tour on stripe payment checkout page
    client_reference_id: req.params.tourId, // Here we will specify a custom field which is called client-reference-id and this field allows us to pass in some data about the
    // session that we are currently creating. And this field is important because once the credit card payment is successful, we will then
    // get access to the session object again and by now we want to create a new booking in our database. To create a new Booking in our
    // database we will need the tourId , userId and the price of the tour and in this session we already has access to the user's email
    // and from this email we can recreate the userId because email here is unique.
    // line_items: [
    //   {
    //     name: `${tour.name} Tour`,
    //     description: tour.summary,
    //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    //     amount: tour.price * 100, // The price of the Tour that the client (or) the user want to purchase , We are multiplying with 100
    //     // because stripe accepts the price in cents(1$ = 100cents)
    //     currency: "usd",
    //     quantity: 1, // User can purchase one tour
    //   },
    // ], // This line_items field accepts an array of objects which is basically one per item and all these line_items are provided by
    // // Stripe . So everyone whoever using this Stripe API has to give the same names otherwise it will give you an error
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  // Step 3: Create the session as response and send it back to the client
  res.status(200).json({
    status: "success",
    session,
  });
});

// // Function to create a new booking in our database.
// // This is only TEMPORARY, because it is UNSECURE : everyone can make bookings without paying
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query; // Here we are getting the tourId , userId and the price of the tour from the query string
//   // We will create a new booking in our database when all the above tour,user and price are present in our query string. If they don't
//   // exist then simply go to the next middleware.

//   if (!tour && !user && !price) return next(); // What exactly this next() middleware is , we want to create a new booking on the
//   // above success URL which is the home page once the Stripe payment is successful. so this middleware has to be added to this home
//   // route which is in viewRoutes.js file and the route is "router.get("/",authController.isLoggedIn,viewController.getOverview)" because
//   // this is the home page route which is getOverview which will hit once our Stripe payment is successfully completed. So at this
//   // point of time we want to create a new booking in our database. So in this route only we want to add our middleware.

//   // Creating a new Booking in our database
//   await Booking.create({ tour, user, price });

//   // We want the entire URL but without a query string
//   res.redirect(req.originalUrl.split("?")[0]); // req.originalUrl is the entire URL from which the request was made including the query string. So to
//   // skip the query string we are going to split it by the "?" to skip the query string . Here the redirect will basically create a
//   // new request with the new URL which we passed above by skipping the query string. So this redirect will create a new request to our
//   // root URL("/") which is the homepage. This will hit again our home page route which is
//   //  "router.get("/",bookingController.createBookingCheckout,authController.isLoggedIn,viewController.getOverview)" and this time
//   // it will hit again this "bookingController.createBookingCheckout" route but without the query string so this time whenever we are
//   // hitting this route second time without a query string then "!tour , !user , !price" will be true and we will go to the next middleware
//   // which is then nothing but going to our homepage route which is "viewController.getOverview"
// });

// The below function will accept a session data which is created above which is stripe.checkout.sessions.create() function which is
// provided by the Stripe
const createBookingCheckout = catchAsync(async (session) => {
  const tour = session.client_reference_id; // This is coming from the stripe.checkout.sessions.create() function which is provided by
  //  client_reference_id: req.params.tourId.
  const user = (await User.findOne({ email: session.customer_email })).id; // This is coming from the stripe.checkout.sessions.create()
  // function and from there we retrieving the userId from our database based on the email provided by the user on the request.
  // const price = session.line_items[0].price_data.unit_amount / 100;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
});

// The below code will run when the Stripe payment is successfully completed then the Stripe will call our webhook which is webookCheckout
//  with the success_url and then this webhookCheckout function will receive a body from the request and then together with the signature
// and the webhook secret we will create a Stripe event which will contain a session and then we will use this event to create a
// new booking in our database
exports.webhookCheckout = (req, res, next) => {
  // To read the Stripe signature from the headers
  const signature = req.headers["stripe-signature"]; // When stripe calls our webhook then it will add a header to our request containing
  // a special signature for our webhook
  // In ES6, const and let are block scoped. So the below event variable which is inside the try block will not be available outside the
  // try block
  let event;
  // Creating a Stripe event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    ); // And remember that this body has to be in raw form and to this constructEvent()
    // we will give the signature that is sent along with the header and the third argument is our webhook secret
  } catch (err) {
    // If there is an error here , We want to send this error back to Stripe
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // If the event that we are listening to "checkout.session.completed" then we want to create a new booking in our database.
    createBookingCheckout(event.data.object); // Here the session is coming from event.data.object and then finally send back some
    // response back to the Stripe
    res.status(200).json({ received: true });
  }
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
