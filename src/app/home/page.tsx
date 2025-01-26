"use client";

import { useState, useEffect, useRef } from "react";
import { parse } from 'marked';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function Home() {
    const [messages, setMessages] = useState<{ text: string; sender: string }[]>([{ text: "Hi. How many I help you today ?", sender: "System" }]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>();
    const [user, setUser] = useState<string>('');
    const [file, setFile] = useState<File>();

    const pdfRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            if (pdfRef.current) {
                const { scrollTop, clientHeight, scrollHeight } = pdfRef.current;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight;
                const isAtTop = scrollTop === 0;

                if (isAtBottom && pageNumber < (numPages || 0) && lastScrollTop.current !== scrollTop) {
                    lastScrollTop.current = scrollTop;
                    handleNextPage();
                } else if (isAtTop && pageNumber > 1 && lastScrollTop.current !== scrollTop) {
                    lastScrollTop.current = scrollTop;
                    handlePrevPage();
                }
            }
        };

        const currentPdfRef = pdfRef.current;
        currentPdfRef?.addEventListener("scroll", handleScroll);

        return () => {
            currentPdfRef?.removeEventListener("scroll", handleScroll);
        };
    }, [pdfRef, pageNumber, numPages]);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId') || '';
        setUser(userId);
        getFile()
    }, [])

    useEffect(() => {
        getFile()
    }, [user])

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const target = event.target as HTMLAnchorElement; // Type assertion
        const hrefAttribute = target?.attributes?.getNamedItem('href'); // Get the href attribute
        if (hrefAttribute?.value) {
            event.preventDefault();
            const pageNum = hrefAttribute?.value.split(".")[0]?.replace('#', '');
            setPageNumber(Number(pageNum))
        }
    }

    const handleSendMessage = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevents page refresh
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: "User" }]);
            setInput(""); // Clear the input box
            setLoading(true); // Set loading to true

            try {
                const response = await fetch('/api/chat', {
                    method: "POST",
                    body: JSON.stringify({ question: input, history: messages }),
                    headers: {
                        'User-Id': user
                    }
                });
                if (response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder("utf-8");
                    let systemMessage = ""; // Initialize a variable to accumulate the message

                    // Add an initial system message entry
                    setMessages((prevMessages) => [...prevMessages, { text: "", sender: "System" }]);

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        systemMessage += chunk; // Accumulate the message
                        // Update the last message in the messages array
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            updatedMessages[updatedMessages.length - 1] = { text: systemMessage, sender: "System" };
                            return updatedMessages;
                        });
                    }
                } else {
                    console.error("Response body is null");
                }
            } catch (error) {
                console.error("Error fetching response:", error);
            } finally {
                setLoading(false); // Set loading to false
            }
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const handleNextPage = () => {
        if (pageNumber < (numPages || 0)) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handlePrevPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const getFile = async () => {
        const fileRes = await fetch('/api/document', {
            headers: {
                'User-Id': user
            }
        });
        if (!fileRes.ok) return;
        console.log(fileRes)
        const blob = await fileRes.blob(); // Convert Response to Blob
        const file = new File([blob], 'document.pdf'); // Create a File object
        setFile(file); // Set the File object
    }

    const handleUpload = async (file: File | null) => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            await fetch("/api/document", {
                method: "POST",
                body: formData,
                headers: {
                    'User-Id': user
                }
            });
            getFile()
        }
    }

    return (
        <div className="flex overflow-hidden" style={{ height: "92vh" }}>
            <div className="w-1/2 h-full flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`p-2 rounded mb-2 text-black ${message.sender === "User" ? "bg-blue-100" : "bg-gray-100"}`}>
                            <span
                                onClick={handleClick}
                                className="parsed-text"
                                dangerouslySetInnerHTML={{ __html: parse(message.text) }}
                            />
                        </div>
                    ))}
                    {loading && <div className="p-2 text-center">Loading...</div>}
                </div>
                <form onSubmit={handleSendMessage} className="flex p-4 items-center">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded-l text-black"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button
                        className="p-2 bg-blue-500 text-white rounded-r"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </form>
            </div>
            <div className="w-1/2 h-full flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
                {file ? (
                    <>
                        <div ref={pdfRef} className="flex-1 overflow-auto p-4">
                            <div>
                                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page pageNumber={pageNumber} />
                                </Document>
                                <p>
                                    Page {pageNumber} of {numPages}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between p-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={pageNumber === 1}
                                className={`p-2 rounded ${pageNumber === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                &#8592;
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={pageNumber === numPages}
                                className={`p-2 rounded ${pageNumber === numPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                &#8594;
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <input
                            type="file"
                            id="fileUpload"
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files ? e.target.files[0] : null)}
                            accept="application/pdf"
                        />
                        <button
                            className="w-64 h-24 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                            onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                            Upload File
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

