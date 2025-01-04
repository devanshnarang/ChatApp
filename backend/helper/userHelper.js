import bcrypt from 'bcrypt';

export const hashPassword=async(password)=>{
    try {
        const hashedPassword=await bcrypt.hash(password,5);
        return hashedPassword;
    } catch (error) {
        console.log("Error in encrypting Password");
        console.log(error.message);
    }
}

export const comparePassword=async(password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword);
}