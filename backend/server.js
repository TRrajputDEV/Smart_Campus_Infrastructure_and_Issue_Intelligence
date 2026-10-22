
import cors from 'cors';
import express from 'express';
import app from './src/app.js'; 
import dbconn from './src/routes/dbconn.js';




app.use(cors());
app.use(express.json());





const port = process.env.PORT || 5000;



app.listen(port, () => {
	console.log(`Backend server listening on port ${port}`);
	dbconn();
});
