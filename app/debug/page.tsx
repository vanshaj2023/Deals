"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const checkAdminAccess = async () => {
    if (status === 'loading') {
      return;
    }

    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      // Check if user exists in database and is admin
      const response = await fetch(`/api/user?email=${session.user.email}`);
      const data = await response.json();
      
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Not admin, redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
    setCheckingAccess(false);
  };

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-db');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Error checking database:', error);
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      setSeedResult(data);
      // Refresh database status
      await checkDatabase();
    } catch (error) {
      console.error('Error seeding database:', error);
      setSeedResult({ success: false, error: 'Failed to seed database' });
    }
    setSeeding(false);
  };

  useEffect(() => {
    checkAdminAccess();
  }, [status, session]);

  useEffect(() => {
    if (isAdmin) {
      checkDatabase();
    }
  }, [isAdmin]);

  // Show loading while checking access
  if (checkingAccess || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not logged in
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
          <a 
            href="/sign-in" 
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-4">This page is restricted to administrators only.</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to home page...</p>
          <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-800">
               Database Debug Panel
            </h1>
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
               Admin
            </span>
          </div>
          <p className="text-gray-600 mb-8">
            Check your database status and add sample products
          </p>

          {/* Database Status */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              Database Statistics
              <button 
                onClick={checkDatabase}
                className="ml-auto text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Refresh
              </button>
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : dbStatus?.success ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {dbStatus.stats.totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {dbStatus.stats.promotedProducts}
                  </div>
                  <div className="text-sm text-gray-600">Promoted</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {dbStatus.stats.regularProducts}
                  </div>
                  <div className="text-sm text-gray-600">Regular</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {dbStatus.stats.totalUsers}
                  </div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
              </div>
            ) : (
              <div className="text-red-600 text-center py-4">
                Error loading database stats
              </div>
            )}

            {dbStatus?.sampleProducts && dbStatus.sampleProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Sample Products:</h3>
                <div className="space-y-2">
                  {dbStatus.sampleProducts.map((product: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-800">{product.title}</div>
                      <div className="text-gray-600">${product.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seed Button */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Seed Sample Products
            </h2>
            <p className="text-gray-600 mb-4">
              Add 12 sample trending products to your database
            </p>
            <button
              onClick={seedDatabase}
              disabled={seeding}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Adding Products...
                </span>
              ) : (
                'Add Sample Products'
              )}
            </button>
          </div>

          {/* Seed Result */}
          {seedResult && (
            <div className={`rounded-xl p-6 ${seedResult.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <h3 className={`text-xl font-bold mb-2 ${seedResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {seedResult.success ? 'Success!' : 'Error'}
              </h3>
              <p className={seedResult.success ? 'text-green-700' : 'text-red-700'}>
                {seedResult.message || seedResult.error}
              </p>
              {seedResult.details && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Added:</span>
                    <span className="font-bold">{seedResult.details.added}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skipped:</span>
                    <span className="font-bold">{seedResult.details.skipped.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">{seedResult.details.totalPromoted}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/trending" 
              className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
            >
              View Trending Page
            </a>
            <a 
              href="/add-product" 
              className="block bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition"
            >
              Add Product Manually
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
