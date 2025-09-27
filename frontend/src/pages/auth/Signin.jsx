import React from "react"

export const Component = () => {
    return (
        <div id="webcrumbs">
            <div className="flex min-h-screen">
                <div className="w-5/12 bg-indigo-800 text-white p-12 flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">Reference site about Lorem Ipsum..</h1>
                    <p className="text-sm leading-relaxed">
                        What is Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown
                        printer took a galley of type and scrambled it to make a type specimen book it has?
                    </p>
                </div>

                <div className="w-7/12 flex flex-col justify-center relative overflow-hidden">
                    <div className="ml-auto w-8/12 px-6">
                        <h2 className="text-2xl font-bold mb-1">Welcom Back!</h2>
                        <p className="text-sm text-gray-600 mb-4">Please sign in to your account</p>

                        <div className="flex justify-center space-x-3 mb-2">
                            <button className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                                <i className="fa-brands fa-facebook"></i>
                            </button>
                            <button className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-300 transition-colors">
                                <i className="fa-brands fa-twitter"></i>
                            </button>
                            <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                                <i className="fa-brands fa-linkedin"></i>
                            </button>
                        </div>

                        <div className="flex items-center mb-6">
                            <div className="h-px bg-gray-200 flex-grow"></div>
                            <span className="px-4 text-xs text-gray-400">or continue with</span>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value="mail@gmail.com"
                                    className="w-full border border-gray-200 rounded-md py-2 px-3"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value="******"
                                className="w-full border border-gray-200 rounded-md py-2 px-3"
                            />
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="mr-2" />
                                <label htmlFor="remember" className="text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
                                Forgot your password?
                            </a>
                        </div>

                        <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md transition-colors mb-6">
                            Sign in
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">Don't have an account?</p>
                            <a href="#" className="text-indigo-500 hover:text-indigo-600 transition-colors text-sm">
                                Sign up
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
