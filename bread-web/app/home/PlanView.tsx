'use client'
import React from 'react'
import { ArrowLeft, ArrowRight, CheckSquare2, ChevronDown, Plus, Square } from "lucide-react";
import { useState } from "react";



const PlanView = () => {

    return (
        <div className="h-full w-full flex flex-col">
            <Topbar />
            <div className='flex h-full w-full'>
            <Categories />
            <Info />
            </div>
        </div>
    )
}


const Category = ({ CategoryName }: { CategoryName: string }) => {
    return (
        <div className="w-full p-2.5 flex border-t-[1px] border-neutral-800 justify-between bg-neutral-950 overflow-hidden">
            <div className="flex justify-center items-center gap-2">
                <div className="flex">
                    <div className="h-6 w-6"> </div>
                    <div className="h-6 w-6 flex items-center justify-center cursor-pointer">
                        <Square size={16} color="#525252" fill="#171717" />
                    </div>
                </div>
                <p className="text-sm">{CategoryName}</p>
            </div>
            <div className="flex gap-5 items-center">
                <p className="w-32 text-sm text-right px-2.5">$0.00</p>
                <p className="w-32 text-sm text-right px-2.5">$0.00</p>
                <p className="w-32 text-sm text-right px-2.5">$0.00</p>
            </div>
        </div>
    )

};

const CategoryGroup = () => {
    return (
        <div className="flex flex-col">
            <div className="w-full p-2.5 flex border-t-[1px] border-neutral-800 justify-between bg-neutral-900 overflow-hidden">
                <div className="flex justify-center items-center gap-2">
                    <div className="flex">
                        <div className="h-6 w-6 flex items-center justify-center hover:bg-neutral-800 rounded-sm cursor-pointer">
                            <ChevronDown size={16} />
                        </div>
                        <div className="h-6 w-6 flex items-center justify-center cursor-pointer">
                            <Square size={16} color="#525252" fill="#171717" />
                        </div>
                    </div>
                    <p className="text-sm font-bold">Bills</p>
                </div>
                <div className="flex gap-5 items-center">
                    <p className="w-32 text-sm font-bold text-right px-2.5">$0.00</p>
                    <p className="w-32 text-sm font-bold text-right px-2.5">$0.00</p>
                    <p className="w-32 text-sm font-bold text-right px-2.5">$0.00</p>
                </div>
            </div>
            <Category CategoryName="Rent/Mortgage" />
            <Category CategoryName="Phone" />
            <Category CategoryName="Internet" />
            <Category CategoryName="Utilities" />
        </div>
    );
};

const Categories = () => {
    const [selectedCategory, setSelectedCategory] = useState(false);
    return (
        // the whole container
        <div className="flex flex-col h-full w-3/4 p-2.5 gap-3">
            {/* header thing to add new category */}
            <div className="p-2.5 text-sm w-full font-bold flex border-[1px] border-neutral-800 bg-neutral-950 rounded-full gap-2">
                <div className="transition-all p-0.5 hover:cursor-pointer rounded-full border-[1px] flex justify-center items-center bg-neutral-800 border-neutral-700 hover:bg-white hover:text-black hover:border-white">
                    <Plus size={16} />
                </div>
                <p>Category Group</p>
            </div>

            <div className="w-full flex flex-col border-neutral-800 rounded-lg border-[1px] overflow-hidden">
                {/* this one table header below */}
                <div className="w-full p-2.5 flex  justify-between bg-neutral-900 overflow-hidden">
                    <div className="flex justify-center items-center gap-2">
                        <div className="flex">
                            <div className="h-6 w-6 flex items-center justify-center hover:bg-neutral-800 rounded-sm cursor-pointer">
                                <ChevronDown size={16} />
                            </div>
                            <div onClick={() => setSelectedCategory(!selectedCategory)} className="h-6 w-6 flex items-center justify-center cursor-pointer">
                                {selectedCategory ?
                                    <Square size={16} color="#525252" fill="#171717" />
                                    : <CheckSquare2 size={20} color="black" fill="white" />
                                }
                            </div>
                        </div>
                        <p className="text-sm font-bold text-neutral-500">Categories</p>
                    </div>
                    <div className="flex gap-5 items-center">
                        <p className="w-32 text-sm font-bold text-neutral-500 text-right px-2.5">Assigned</p>
                        <p className="w-32 text-sm font-bold text-neutral-500 text-right px-2.5">Available</p>
                        <p className="w-32 text-sm font-bold text-neutral-500 text-right px-2.5">Activity</p>
                    </div>
                </div>

                <CategoryGroup />
            </div>
        </div>
    );
};


const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface CalendarProps {
    currMonth: number;
    setCurrMonth: React.Dispatch<React.SetStateAction<number>>;
}
const Calendar = ({ currMonth, setCurrMonth }: CalendarProps) => {
    const incr = () => {
        setCurrMonth((currMonth + 1) % 12);
        console.log(currMonth);
    }
    const decr = () => {
        if (currMonth === 0) {
            setCurrMonth(11);
        } else {
            setCurrMonth((currMonth - 1) % 12);
        }
    }
    return (
        <div className="p-2.5 rounded-xl bg-neutral-900 border-[1px] border-neutral-700 flex flex-col items-center">
            <div className='w-full flex justify-center items-center'>
                <div className='text-xl text-neutral-300 font-light'>2025 </div>
            </div>
            <div className='flex justify-around w-full items-center gap-2.5'>
                <div onClick={decr} className='transition-all p-0.5 hover:cursor-pointer rounded-full border-2 flex justify-center items-center bg-neutral-800 border-neutral-700 hover:bg-white hover:text-black hover:border-white'>
                    <ArrowLeft size={16} />
                </div>
                <div className='text-center text-2xl font-black w-[55px]'>{months[currMonth % 12]}</div>
                <div onClick={incr} className='transition-all hover:cursor-pointer p-0.5 rounded-full border-2 flex justify-center items-center bg-neutral-800 border-neutral-700 hover:bg-white hover:text-black hover:border-white'>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    )
}

const Topbar = () => {
    const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth());
    return (
        <div className='flex gap-2.5 select-none px-2.5'>
            <Calendar currMonth={currMonth} setCurrMonth={setCurrMonth} />
            <div className='p-2.5 flex flex-row border-[1px] border-neutral-700 rounded-xl bg-neutral-900 items-center '>
                <div className='p-2.5 font-bold text-xl'>$30,000.32</div>
                <div className='p-2.5 font-bold text-xl'>Available to assign</div>
            </div>
        </div>
    )
}

const Info = () => {
    return (
        <div className='w-1/4 h-full flex items-center justify-center px-5 py-2.5'>Info</div>
    )
}


export default PlanView