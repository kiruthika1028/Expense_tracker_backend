const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const mongourl="mongodb+srv://kiruthikasivakumar1028:kiruthikasivakumar1028@cluster0.lf7rz0a.mongodb.net/"
mongoose.connect(mongourl)
.then(()=>{
    console.log("database connected successfully")
    app.listen(port,()=>{
        console.log(`server is running at port ${port}`)
    })
})
.catch((err)=>console.log(err))

const expenseSchema = new mongoose.Schema({
    id:{type:String,required:true,unique:true},
    title:{type:String,required:true},
    amount:{type : Number,required:true},
});
const expenseModel=mongoose.model("expense-tracker",expenseSchema)

app.get("/api/expenses",async(req,res)=>{
    try{
        const expenses = await expenseModel.find();
        res.status(200).json(expenses);
    }catch(error){
            res.status(500).json({message:"failed to fetch expenses"});
        }
    });
app.get("/api/expenses/:id",async(req,res)=>{
    try{
        const{id}=req.params;
        const expense = await expenseModel.findOne({id});
        if(!expense){
            return res.status(404).json({message:"expense not found"})
        }
        res.status(200).json(expense);
    }catch(error){
        res.status(500).json({message:"error in fetching expenses"})
    }
});

const{v4:uuidv4}=require("uuid");
app.post("/api/expenses",async(req,res)=>{
    let body="";
    req.on("data",(chuck)=>{
        body+=chuck;
    })
    req.on("end",async()=>{
        const data=JSON.parse(body);
        const newExpense=new expenseModel({
            id:uuidv4(),
            title:data.title,
            amount:data.amount,
        });
        const savedExpense=await newExpense.save();//save to database
        res.status(200).json(savedExpense);//send response
        })  ; 
     });

//update
app.use(express.json());
app.put("/api/expenses/:id", async (req,res)=>{
    const {id} = req.params;
    const {title,amount} = req.body;
    console.log({title})
    try{
        const updateExpense = await expenseModel.findOneAndUpdate(
            {id},
            {title,amount}
        );
        if(!updateExpense){
            return res.status(400).json({message:"Expense not found"});
        }
        res.status(200).json({title,amount});
    }
    catch(error){
        res.status(500).json({message:"Error in updating expense"});
    }
});
// const data = [
//     {id:1,name:"a",address:"aa"},
//     {id:1,name:"b",address:"bb"},  
//     {id:1,name:"c",address:"cc"}, 
// ];

// //"/api/data/" is the path name
// app.get('/students/details',(req,res)=>{
//     res.json(data);
// });

// app.listen(port,()=> {
//     console.log(`server is running on http://localhost:${port}`);
// });

// app.get("/api/singledata",(req,res)=>{
//     const { id } = req.query;
//     if(id){
//         const result = data.find((item)=>item.id === Number(id);
//         if(result){
//             res.json(result);
//         }else{
//             res.status(400).json({error:"data not found "})
//         }
//     }else{
//         res.json(data);
//     }
// });

// app.get("/api/singledata",(req,res)=>{
//     const { name } = req.query;
//     if(name){
//         const result = data.find((item)=>item.name === String(name));
//         if(result){
//             res.json(result);
//         }else{
//             res.status(400).json({error:"data not found "})
//         }
//     }else{
//         res.json(data);
//     }
// });
 
// app.get("/api/singledata",(req,res)=>{
//     const { id,name } = req.query;
//     if(id,name){
//         const result = data.find(((item)=>item.id === Number(id))&& ((item)=>item.name === String(name)));
//         if(result){
//             res.json(result);
//         }else{
//             res.status(400).json({error:"data not found "})
//         }
//     }else{
//         res.json(data);
//     }
// });