"use client"
import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form'

interface Props {

}

const SignUp = () => {

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<SignUpFormData>({
        defaultValues:{
            email:"",
            password:"",
        },
        mode:"onBlur"
    });

    const onSubmit=async(data: SignInFormData) => {
        try {
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }
  return (
    <>
        <h1 className='form-title'>Log In To Your Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

            <InputField 
            name="email"
            label="Email"
            placeholder='john.doe@example.com'
            register={register}
            error={errors.email}
            validation={{required:"Email is required", pattern: {value: /^\S+@\S+$/i, message: "Email is invalid"}}}
            />

            <InputField 
            name="password"
            label="Password"
            placeholder='Enter your password.....'
            type="password"
            register={register}
            error={errors.password}
            validation={{required:"Password is required", minLength: {value: 8, message: "Password must be at least 8 characters long"}}}
            />

            <Button type="submit" disabled={isSubmitting} className='yellow-btn w-full mt-5'>
                {isSubmitting ? 'Signing In.....' : 'Sign In'}
            </Button>
            
            <FooterLink 
                text="Don't have an account yet?"
                linkText="Sign Up"
                href="/sign-up"
            />
        </form>

    </>
  )
}

export default SignUp