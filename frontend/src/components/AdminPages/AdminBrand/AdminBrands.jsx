import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd';
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined, EditOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddBrand from './AddBrand';
import EditBrand from './EditBrand';
import apiService from '../../../services/api';

const AdminBrands = () => {
    const [refresh, setRefresh] = useState(false);
    const [brands, setBrands] = useState([]);
    const [modalChild, setModalChild] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiService.getAllBrands();
                const rawData = response.data || [];
                if (Array.isArray(rawData)) {
                    setBrands(rawData);
                } else {
                    console.error('Dữ liệu trả về không phải mảng:', rawData);
                    message.error('Dữ liệu thương hiệu không hợp lệ.');
                    setBrands([]);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
                message.error('Không thể lấy dữ liệu thương hiệu.');
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);

    const onRefresh = () => {
        setRefresh((prev) => !prev);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters && clearFilters();
        confirm();
        setSearchText('');
    };

     const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    // Hàm thực hiện việc xóa (giữ nguyên)
    const deleteBrand = async (brandId) => { // Nhận brandId thay vì cả object
        setLoading(true);
        try {
            await apiService.deleteBrand(brandId);
            onRefresh(); // Lấy lại dữ liệu mới nhất
            message.success(`Đã xóa thương hiệu.`); // Thông báo chung chung hơn
        } catch (error) {
            console.error('Lỗi khi xóa thương hiệu:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa thương hiệu thất bại.`;
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // *** Sửa hàm này: Chỉ cập nhật state để hiển thị modal ***
    const showDeleteConfirmModal = (brand) => {
        console.log("Setting brand to delete and showing confirm modal:", brand);
        setBrandToDelete(brand); // Lưu lại brand cần xóa
        setIsConfirmDeleteModalVisible(true); // Mở modal xác nhận
    };

    // *** Hàm xử lý khi nhấn OK trên modal xác nhận xóa ***
    const handleConfirmDelete = async () => {
        if (brandToDelete) {
            console.log("Confirming delete for:", brandToDelete);
            await deleteBrand(brandToDelete.brandId); // Gọi hàm xóa với ID
        }
        setIsConfirmDeleteModalVisible(false); // Đóng modal
        setBrandToDelete(null); // Reset state
    };

    // *** Hàm xử lý khi nhấn Cancel hoặc đóng modal xác nhận xóa ***
    const handleCancelDelete = () => {
        console.log("Cancelled delete");
        setIsConfirmDeleteModalVisible(false); // Đóng modal
        setBrandToDelete(null); // Reset state
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'brandId',
            key: 'brandId',
            width: 150,
            align: 'center',
            sorter: (a, b) => a.brandId - b.brandId,
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('brandId'),
        },
        {
            title: 'Logo',
            dataIndex: 'logoUrl',
            key: 'logoUrl',
            align: 'center',
            width: 200,
            render: (logoUrl) => logoUrl ? <Image width={80} height={80} src={logoUrl} preview={true} style={{ objectFit: 'contain' }} /> : 'Không có logo',
        },
        {
            title: 'Tên Thương Hiệu',
            dataIndex: 'brandName',
            key: 'brandName',
            sorter: (a, b) => a.brandName.localeCompare(b.brandName),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('brandName'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalChild(
                                <EditBrand brand={record} setModalChild={setModalChild} handleRefresh={onRefresh} />
                            );
                        }}
                        aria-label={`Sửa thương hiệu ${record.brandName}`}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation();
                            // *** Gọi hàm mới để mở modal xác nhận ***
                            showDeleteConfirmModal(record);
                            // ****************************************
                        }}
                        aria-label={`Xóa thương hiệu ${record.brandName}`}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    onClick={() =>
                        setModalChild(<AddBrand setModalChild={setModalChild} handleRefresh={onRefresh} />)
                    }
                    icon={<PlusCircleFilled />}
                >
                    Thêm Thương Hiệu
                </Button>
            </Space>

            {/* Modal cho Thêm/Sửa Thương Hiệu */}
            <Modal
                title={modalChild?.type === AddBrand ? 'Thêm Thương Hiệu' : modalChild?.type === EditBrand ? 'Sửa Thương Hiệu' : false}
                centered
                open={modalChild !== null}
                onCancel={() => setModalChild(null)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={720}
                bodyStyle={{ maxHeight: '75vh', overflowY: 'auto' }}
            >
                {modalChild}
            </Modal>

            {/* *** Modal xác nhận xóa *** */}
            <Modal
                title="Xác nhận xóa"
                open={isConfirmDeleteModalVisible} // Hiển thị dựa trên state
                onOk={handleConfirmDelete} // Hàm xử lý khi nhấn OK
                onCancel={handleCancelDelete} // Hàm xử lý khi nhấn Cancel
                okText="Xóa"
                cancelText="Hủy"
                okType="danger" // Màu đỏ cho nút OK
                confirmLoading={loading} // Hiển thị loading trên nút OK khi đang xóa
                maskClosable={false} // Không cho đóng khi click bên ngoài
                centered // Hiển thị giữa màn hình
            >
                {/* Nội dung của modal */}
                {brandToDelete && (
                    <p>Bạn có chắc chắn muốn xóa thương hiệu <strong>{brandToDelete.brandName}</strong> (Mã: {brandToDelete.brandId}) không?</p>
                )}
            </Modal>
            {/* ************************* */}

            <Table
                bordered
                columns={columns}
                dataSource={brands}
                rowKey="brandId"
                loading={loading && !isConfirmDeleteModalVisible} // Chỉ loading table khi không phải loading của modal xóa
                pagination={{
                    pageSizeOptions: ['5', '10', '15', '20'],
                    showSizeChanger: true,
                    defaultPageSize: 5,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thương hiệu`,
                    size: 'default',
                    style: { marginTop: '20px' },
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};
export default AdminBrands;