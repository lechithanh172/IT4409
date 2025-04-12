import React from 'react';

const Footer = () => {
    return (
        <footer className="text-center text-lg-start text-white" style={{ backgroundColor: '#6f161f' }}>
            {/* Section: Social media */}
            <section className="d-flex justify-content-between p-4" style={{ backgroundColor: '#d70016' }}>
                <div className="me-5">
                    <span>Get connected with us on social networks:</span>
                </div>
                <div>
                    <a href="#" className="text-white me-4 p-4 ">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="text-white me-4 p-4">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="text-white me-4 p-4">
                        <i className="fab fa-google"></i>
                    </a>
                    <a href="#" className="text-white me-4 p-4">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="text-white me-4 p-4">
                        <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="text-white me-4 p-4">
                        <i className="fab fa-github"></i>
                    </a>
                </div>
            </section>

            {/* Section: Links */}
            <section className="container text-center text-md-start mt-5">
                <div className="row mt-3">
                    <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                        <h6 className="text-uppercase fw-bold">Company name</h6>
                        <hr
                            className="mb-4 mt-0 d-inline-block mx-auto"
                            style={{ width: '60px', backgroundColor: '#fff', height: '2px' }}
                        />
                        <p>
                            Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit
                            amet.
                        </p>
                    </div>

                    <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                        <h6 className="text-uppercase fw-bold">Hỗ trợ khách hàng</h6>
                        <hr
                            className="mb-4 mt-0 d-inline-block mx-auto"
                            style={{ width: '60px', backgroundColor: '#fff', height: '2px' }}
                        />
                        <p>
                            <a href="#" className="text-white">
                                Tra cứu đơn hàng
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                                Hướng dẫn mua hàng trực tuyến
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                                Hướng dẫn thanh toán
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                                Góp ý, Khiếu Nại
                            </a>
                        </p>
                    </div>

                    <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                        <h6 className="text-uppercase fw-bold">Thông tin khuyến mại</h6>
                        <hr
                            className="mb-4 mt-0 d-inline-block mx-auto"
                            style={{ width: '60px', backgroundColor: '#fff', height: '2px' }}
                        />
                        <p>
                            <a href="#" className="text-white">
                            Thông tin khuyến mại
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                            Sản phẩm khuyến mại
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                            Sản phẩm mới
                            </a>
                        </p>
                        <p>
                            <a href="#" className="text-white">
                                Hỗ trợ
                            </a>
                        </p>
                    </div>

                    <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                        <h6 className="text-uppercase fw-bold">Liên hệ</h6>
                        <hr
                            className="mb-4 mt-0 d-inline-block mx-auto"
                            style={{ width: '60px', backgroundColor: '#fff', height: '2px' }}
                        />
                        <p>
                            <i className="fas fa-home mr-3"></i> New York, NY 10012, US
                        </p>
                        <p>
                            <i className="fas fa-envelope mr-3"></i> info@example.com
                        </p>
                        <p>
                            <i className="fas fa-phone mr-3"></i> +01 234 567 88
                        </p>
                        <p>
                            <i className="fas fa-print mr-3"></i> +01 234 567 89
                        </p>
                    </div>
                </div>
            </section>

            {/* Copyright */}
            <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                © 2025 Copyright:{' '}
                <a className="text-white" href="https://hacom.vn/">
                    Hacom
                </a>
            </div>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
            ></link>
        </footer>
    );
};

export default Footer;
