import React from 'react';

const LabelPreview = ({ labelImage, labelData, crisisCommunication }) => {
    const handleDownload = () => {
        if (labelImage && labelData?.filename) {
            const link = document.createElement('a');
            link.href = labelImage;
            link.download = labelData.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleCopyImage = () => {
        if (labelImage) {
            // Convert base64 to blob and copy to clipboard
            fetch(labelImage)
                .then(res => res.blob())
                .then(blob => {
                    const clipboardItem = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([clipboardItem]);
                })
                .catch(err => console.error('Failed to copy image:', err));
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    Generated Label Preview
                </h2>
            </div>
            
            <div className="p-6 space-y-6">
                {labelImage ? (
                    <>
                        {/* Label Image */}
                        <div className="bg-white rounded-lg p-4 shadow-inner">
                            <img 
                                src={labelImage} 
                                alt="Generated Nutrition Label" 
                                className="max-w-full h-auto mx-auto rounded-lg shadow-md" 
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download PNG
                            </button>
                            
                            <button
                                onClick={handleCopyImage}
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy Image
                            </button>
                        </div>

                        {/* File Info */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-300 mb-2">File Information</h3>
                            <div className="text-xs text-gray-400 space-y-1">
                                <div><span className="text-gray-300">Filename:</span> {labelData?.filename || 'label.png'}</div>
                                <div><span className="text-gray-300">Format:</span> PNG (300 DPI)</div>
                                <div><span className="text-gray-300">Market:</span> {labelData?.market || 'Unknown'}</div>
                                <div><span className="text-gray-300">Generated:</span> {new Date().toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Crisis Communication */}
                        {crisisCommunication && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    Crisis Communication Text
                                </h3>
                                <p className="text-red-200 text-sm leading-relaxed">{crisisCommunication}</p>
                            </div>
                        )}

                        {/* Raw Label Data */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Raw Label Data</h3>
                            <div className="bg-gray-800 rounded-md p-3 max-h-64 overflow-y-auto">
                                <pre className="whitespace-pre-wrap break-words text-xs text-gray-300 leading-relaxed">
                                    {JSON.stringify(labelData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21,15 16,10 5,21"></polyline>
                            </svg>
                            <p>No label generated yet.</p>
                            <p className="text-sm mt-2">Fill the form and click "Generate Label" to create your nutrition label.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabelPreview;