import { Category } from 'bread-core/src'
// import { Icon } from 'lucide-react';
// import { Icon } from './components/Icon';
// import { Camera } from 'lucide-react';
export default function Page() {
  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className="h-fit w-fit flex flex-col gap-5 justify-center items-center p-5">
        <div className='flex w-full text-center items-center'>
          <h1 className="font-bold w-full">hi</h1>
          <h4 className="w-full">this is <a target="_blank" href="https://github.com/lollyxsrinand/bread" className='font-bold text-orange-200 underline underline-offset-8 hover:text-orange-300 transition-all'>bread</a></h4>
          {/* <Icon name="bread" /> */}
          {/* <Camera size="24" /> */}
        </div>
        <div>
          <p className="font-extralight">a budget management <a target='_blank' href="https://ynab.com/" className="text-blue-300 underline-offset-4 font-medium hover:text-blue-400 transition-all">clone</a></p>
        </div>
         <div className="flex gap-2.5 w-full items-center justify-center text-center">
           <a className="button w-full hover:bg-white hover:text-black" href="/login">login</a>
           <a className="button w-full  hover:bg-white hover:text-black" href="/signup">signup</a>
         </div>
      </div>
    </div>
  );
}
