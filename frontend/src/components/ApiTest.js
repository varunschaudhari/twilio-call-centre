import React, { useEffect, useState } from 'react';
import { systemAPI } from '../services/api';
import { useApi } from '../hooks/useApi';

function ApiTest() {
    const [healthStatus, setHealthStatus] = useState(null);
    const { loading, error, executeRequest } = useApi();

    useEffect(() => {
        testApiConnection();
    }, []);

    const testApiConnection = async () => {
        console.log('🔍 Testing API connection...');
        console.log('📍 API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:3000');
        
        try {
            const response = await executeRequest(
                () => systemAPI.healthCheck(),
                {
                    onSuccess: (data) => {
                        console.log('✅ Health check successful:', data);
                        setHealthStatus(data);
                    },
                    onError: (errorInfo) => {
                        console.error('❌ Health check failed:', errorInfo);
                        console.error('🔍 Error details:', {
                            message: errorInfo.message,
                            status: errorInfo.status,
                            data: errorInfo.data
                        });
                    }
                }
            );
        } catch (error) {
            console.error('💥 API test error:', error);
        }
    };

    const testDirectConnection = async () => {
        console.log('🔍 Testing direct connection...');
        try {
            const response = await fetch('http://localhost:3000/health');
            const data = await response.json();
            console.log('✅ Direct fetch successful:', data);
            setHealthStatus(data);
        } catch (error) {
            console.error('❌ Direct fetch failed:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>API Connection Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testApiConnection}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {loading ? 'Testing...' : 'Test API Connection'}
                </button>
                
                <button 
                    onClick={testDirectConnection}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Test Direct Fetch
                </button>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <h4>Connection Info:</h4>
                <p><strong>Frontend URL:</strong> {window.location.origin}</p>
                <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:3000'}</p>
                <p><strong>Health Endpoint:</strong> {(process.env.REACT_APP_API_URL || 'http://localhost:3000') + '/health'}</p>
            </div>

            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px',
                    color: '#721c24',
                    marginBottom: '20px'
                }}>
                    <h4>Error:</h4>
                    <p><strong>Message:</strong> {error.message}</p>
                    <p><strong>Status:</strong> {error.status}</p>
                    {error.data && (
                        <p><strong>Data:</strong> {JSON.stringify(error.data)}</p>
                    )}
                </div>
            )}

            {healthStatus && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px',
                    color: '#155724'
                }}>
                    <h4>Backend Status:</h4>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(healthStatus, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>Expected Backend Response:</h4>
                <p>The backend should return a health check object with:</p>
                <ul>
                    <li>status: "healthy"</li>
                    <li>twilio configuration status</li>
                    <li>account SID and phone number status</li>
                </ul>
            </div>
        </div>
    );
}

export default ApiTest;
