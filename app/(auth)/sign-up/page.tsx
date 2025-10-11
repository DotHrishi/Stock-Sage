"use client"
import {CountrySelectField} from '@/components/forms/CountrySelectField';
import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants';
import React from 'react'
import { useForm } from 'react-hook-form'

interface Props {

}

const SignUp = () => {

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: {errors, isSubmitting}
    } = useForm<SignUpFormData>({
        defaultValues:{
            fullName:"",
            email:"",
            password:"",
            country:"US",
            investmentGoals:"Growth",
            riskTolerance:"Medium",
            preferredIndustry:"Technology"
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
        <h1 className='form-title'>Sign Up & Personalize</h1>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

            <InputField 
            name="fullName"
            label="Full Name"
            placeholder='John Doe'
            register={register}
            error={errors.fullName}
            validation={{required:"Full Name is required", minLength:2}}
            />

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
            placeholder='Enter a strong password.....'
            type="password"
            register={register}
            error={errors.password}
            validation={{required:"Password is required", minLength: {value: 8, message: "Password must be at least 8 characters long"}}}
            />

            <CountrySelectField
              name="country"
              label="Country"
              control={control}
              error={errors.country}
              required
            />

            <SelectField 
            name="investmentGoals"
            label="Investment Goals"
            placeholder="Select your investment goals"
            options={INVESTMENT_GOALS}
            control={control}
            error={errors.investmentGoals}
            required
            />

            <SelectField 
            name="riskTolerance"
            label="Risk Tolerance"
            placeholder="Select your risk level"
            options={RISK_TOLERANCE_OPTIONS}
            control={control}
            error={errors.riskTolerance}
            required
            />

            <SelectField 
            name="preferredIndustry"
            label="Preferred Industry"
            placeholder="Select your preferred industry"
            options={PREFERRED_INDUSTRIES}
            control={control}
            error={errors.preferredIndustry}
            required
            />
            <Button type="submit" disabled={isSubmitting} className='yellow-btn w-full mt-5'>
                {isSubmitting ? 'Creating Account.....' : 'Start your investing Journey....'}
            </Button>
            
            <FooterLink 
                text="Already have an account?"
                linkText="Sign In"
                href="/sign-in"
            />
        </form>

    </>
  )
}

export default SignUp