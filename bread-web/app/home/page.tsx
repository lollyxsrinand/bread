'use client'
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'

import PlanView from './PlanView'
import ReportsView from './ReportsView';
import AllAccountsView from './AllAccountsView';
import SidebarNew from '../components/SidebarNew';

type tabView = 'Plan' | 'Reports' | 'All Accounts';

const Home = () => {
    const [currMonth, setCurrMonth] = useState<number>(new Date().getMonth());
    console.log(currMonth);
    const [currTabView, setTabView] = useState<tabView>('Plan');

    const renderView = () => {
        switch (currTabView) {
            case 'Plan':
                return <PlanView />;
            case 'Reports':
                return <ReportsView />;
            case 'All Accounts':
                return <AllAccountsView />;
            default:
                return <PlanView />;
        }
    }

    return (
        <div className="h-screen w-full flex">
            {/* <Sidebar currTabView={currTabView} setTabView={setTabView}/> */}
            <SidebarNew currTabView={currTabView} setTabView={setTabView}/>
            <div className="h-full w-full flex p-2.5 gap-2.5">
                {renderView()}
                {/* <PlanView /> */}
                {/* <div className='h-full w-full flex'>
                    <Categories />
                    <Info />
                </div> */}
            </div>
        </div>
    )
}

export default Home