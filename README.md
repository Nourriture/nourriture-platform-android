nourriture-android-platform
===========================

Repository for the Nourriture Android application's backend.

The Nourriture Android application's backend is the backend for the Android app. It provides REST API to developers.

Please, refer to the architecture diagram (http://tinyurl.com/qattlat).

********************************************

#### The detailed list of our API
	   
	┌────────┬───────────────────────┬───────────────────┐
	│        │ Name                  │ Path              │
	├────────┼───────────────────────┼───────────────────┤
	│ POST   │ postconsumername001   │ /consumer/:name   │
	├────────┼───────────────────────┼───────────────────┤
	│ GET    │ getconsumerid001      │ /consumer/:id     │
	├────────┼───────────────────────┼───────────────────┤
	│ PUT    │ putconsumername001    │ /consumer/:name   │
	├────────┼───────────────────────┼───────────────────┤
	│ DELETE │ deleteconsumername001 │ /consumer/:name   │
	├────────┼───────────────────────┼───────────────────┤
	│ GET    │ getconsumername001    │ /consumer/:name   │
	├────────┼───────────────────────┼───────────────────┤
	│ GET    │ getconsumer001        │ /consumer/        │
	├────────┼───────────────────────┼───────────────────┤
	│ POST   │ postmoment001         │ /moment/          │
	├────────┼───────────────────────┼───────────────────┤
	│ GET    │ getmomentrecipeid001  │ /moment/:recipeId │
	└────────┴───────────────────────┴───────────────────┘
********************************************
