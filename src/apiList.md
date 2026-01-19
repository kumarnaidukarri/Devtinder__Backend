#DevTinder APIs

## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter

- POST /request/send/:status/:userId
- Post /request/review/:status/:requestId

  send status : interested, ignored
  review status : accepted, rejected

## userRouter:

- GET /users/requests
- GET /users/connections
- GET /users/feed - Gets you the profiles of other users on platform

connection status: ignore(pass), interested(like), accepted, rejected

<!-- The End -->
