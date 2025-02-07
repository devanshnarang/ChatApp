import { error } from "console";
import userModel from "../models/userModel.js";
import generateToken from "../config/generateToken.js";
import { comparePassword, hashPassword } from "../helper/userHelper.js";

export const registrationController = async(req,res)=>{
    try {
        const {name,email,password,pic,publicKey}=req.body;
        if(!name)return res.send({error:'Name is undefined'});
        if(!email)return res.send({error:'Email is undefined'});
        if(!password)return res.send({error:'Password is undefined'});
        console.log(pic);
        const userExists=await userModel.findOne({email});
        if(userExists){
            return res.status(200).send({
                success:true,
                userExists,
                message:"User Already Exists."
            })
        }
        else{
            const hashedPassword= await hashPassword(password);
            const newUser= await userModel({name,email,password:hashedPassword,pic,publicKey}).save();
            const tempToken=generateToken(newUser);
            return res.status(201).send({
                success:true,
                message:'User successfully Created',
                token: tempToken,
                newUser
            })
        }
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:error.message

        })
    }
}

export const loginController = async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email)return res.send({error:'Email is undefined'});
        if(!password)return res.send({error:'Password is undefined'});
        const userExists=await userModel.findOne({email});
        const checking=await comparePassword(password,userExists.password);
        if(userExists && checking){
            const tempToken=generateToken(userExists);
            return res.status(201).send({
                success:true,
                userExists,
                message:"User Login Successfully.",
                token:tempToken,
            })
        }
        else{
            return res.status(200).send({
                success:true,
                message:'Email or Password Invalid',
            })
        }
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:error.message
        })
    }
}

export const allUserController = async(req,res)=>{
    try {
        const keyword=req.query.search?{
            $or:[
                {name:{$regex:req.query.search,$options:"i"}},
                {email:{$regex:req.query.search,$options:"i"}},
            ]
        }:{};
        const users = await userModel.find(keyword).find({_id:{$ne:req.user._id}});
        res.send(users);
    } catch (error) {
        console.log(error.message);
    }
}


export const handleBackupController=async(req,res)=>{
    try {

        const {privateKey,salt,iv} = req.body;
        await userModel.updateOne({_id:req.user._id},{privateKey,salt,iv});

        res.status(201).send({
            success:true,
            message:'back up is successfully',
        })
        
    } catch (error) {
         res.status(500).send({
            success:true,
            message:'not backup',
            error,
        })
    }
}

export const savePublicKeyController=async(req,res)=>{
    try {
        await userModel.updateOne({_id:req.user._id},{publicKey:req.body.publicKey});
        res.status(201).send({
            success:true,
            message:'new public key saved ..',
        })
        
    } catch (error) {
        res.status(500).send({
            success:true,
            message:'new public key is not created',
            error,
        })
    }
}

export const getPublicKeyController=async(req,res)=>{
    try {

        const user=await userModel.findOne({_id:req.body.id});
        res.status(201).send({
            success:true,
            message:'public key fetched',
            publicKey:user.publicKey,
        })

        
    } catch (error) {
        res.status(500).send({
            success:true,
            message:'public key can not fetched server issue',
            error,
        })

    }
}
