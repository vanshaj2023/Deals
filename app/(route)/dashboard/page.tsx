"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { useState } from 'react';
import UserListing from './_components/UserListing';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('listing'); // State to track the active tab

  return (
    <div className="mt-16 mx-auto max-w-4xl p-4 bg-gray-100 shadow-md rounded-lg">
      <h2 className="font-bold text-2xl text-gray-800 border-b-2 border-gray-300 pb-2">
        Dashboard
      </h2>
      <Tabs
        defaultValue="listing"
        className="mt-5"
        onValueChange={(value:any) => setActiveTab(value)} // Update active tab on change
      >
        <TabsList className="flex space-x-4">
          <TabsTrigger
            value="listing"
            className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition ease-in-out duration-200"
          >
            Listing
          </TabsTrigger>
          <TabsTrigger
            value="clicks"
            className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition ease-in-out duration-200"
          >
            Clicks
          </TabsTrigger>
        </TabsList>
        <div
          className={`mt-4 rounded-lg p-4 shadow-sm ${
            activeTab === 'listing' ? 'bg-white' : 'bg-gray-800 text-white'
          }`}
        >
          <TabsContent value="listing">
            <div className={`${activeTab === 'listing' ? 'text-gray-600' : 'text-white'}`}>
              <UserListing />
            </div>
          </TabsContent>
          <TabsContent value="clicks">
            <div className={`${activeTab === 'clicks' ? 'text-white' : 'text-gray-600'}`}>
              Change your password
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;
