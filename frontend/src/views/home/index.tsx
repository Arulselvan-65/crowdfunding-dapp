import { FC } from 'react';
import Link from 'next/link';



export const HomeView: FC = ({ }) => {

  return (

    <div className='md:hero-content mx-auto p-4'>
      <div className="md:hero-content flex flex-col">
        <div className='mt-[10%]'></div>
          <p className='text-[44px] font-roboto text-green-100 font-bold'>Transform Dreams into Reality</p>
          <p className='text-[44px] font-roboto text-green-100 font-bold'>with Your Support!</p>

          <div className='text-[25px] leading-8 text-gray-400 text-center w-[55%]'>
          <p className='font-sans mt-7 text-lg'>Revolutionize crowdfunding with our platform. Discover unique, innovative projects and support passionate creators for their success. Join the movement today.</p>
          </div>

          <Link href="/campaigns">
          <div className='flex mt-12 border-none rounded-full w-56 font-sans text-center h-14 items-center justify-center bg-gradient-to-br from-green-300 to-green-600 text-black text-lg'>
            <h1 className='font-semibold'>Get Started</h1>
          </div>
          </Link>
        </div>
      </div>
  );
};