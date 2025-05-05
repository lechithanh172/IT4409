import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Space, Table, message, Input, Image } from "antd";
import {
  PlusCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import apiService from "../../../services/api";

const AdminCategories = () => {
  const [refresh, setRefresh] = useState(false);
  const [categories, setCategories] = useState([]);
  const [modalChild, setModalChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAllCategories();
        const rawData = response.data || [];
        if (Array.isArray(rawData)) {
          setCategories(rawData);
        } else {
          message.error('Dữ liệu danh mục không hợp lệ.');
          setCategories([]);
        }
      } catch (error) {
        message.error('Không thể lấy dữ liệu danh mục.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const onRefresh = () => setRefresh((prev) => !prev);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters && clearFilters();
    setSearchText("");
    confirm();
    setSearchedColumn("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex === 'categoryId' ? 'mã' : dataIndex === 'categoryName' ? 'tên' : dataIndex}`}
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
    onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
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

  const deleteCategory = async (categoryToDelete) => {
    if (!categoryToDelete || !categoryToDelete.categoryId) {
      message.error("Không tìm thấy ID danh mục để xóa.");
      return;
    }
    setLoading(true);
    try {
      await apiService.deleteCategory(categoryToDelete.categoryId);
      message.success(`Đã xóa danh mục: ${categoryToDelete.categoryName}`);
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `Xóa danh mục thất bại: ${categoryToDelete.categoryName}`;
      message.error(errorMessage);
      setLoading(false);
    }
  };

  const showDeleteConfirmModal = (category) => {
    setCategoryToDelete(category);
    setIsConfirmDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete);
    }
    setIsConfirmDeleteModalVisible(false);
    setCategoryToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteModalVisible(false);
    setCategoryToDelete(null);
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "categoryId",
      key: "categoryId",
      align: "center",
      width: 100,
      sorter: (a, b) => a.categoryId - b.categoryId,
      ...getColumnSearchProps("categoryId"),
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 120,
      align: "center",
      render: (imageUrl, record) =>
        imageUrl ? (
          <Image
            width={80}
            height={80}
            src={imageUrl}
            alt={record.categoryName}
            style={{ objectFit: "contain" }}
            preview={true}
          />
        ) : (
          <span style={{ color: "#bfbfbf" }}>Không có ảnh</span>
        ),
    },
    {
      title: "Tên Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      ellipsis: true,
      sorter: (a, b) => a.categoryName.localeCompare(b.categoryName),
      ...getColumnSearchProps("categoryName"),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 300,
      ...getColumnSearchProps("description"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setModalChild(
                <EditCategory category={record} setModalChild={setModalChild} handleRefresh={onRefresh} />
              );
            }}
            aria-label={`Sửa danh mục ${record.categoryName}`}
          />
          <Button
            type="text"
            danger
            icon={<DeleteFilled />}
            onClick={(e) => {
              e.stopPropagation();
              showDeleteConfirmModal(record);
            }}
            aria-label={`Xóa danh mục ${record.categoryName}`}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() =>
            setModalChild(
              <AddCategory
                setModalChild={setModalChild}
                handleRefresh={onRefresh}
              />
            )
          }
          icon={<PlusCircleFilled />}
        >
          Thêm Danh Mục
        </Button>
      </Space>

      <Modal
        title={modalChild?.type === AddCategory ? 'Thêm Danh Mục Mới' : modalChild?.type === EditCategory ? 'Chỉnh Sửa Danh Mục' : false}
        centered
        open={modalChild !== null}
        onCancel={() => setModalChild(null)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width={750}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto' }}
      >
        {modalChild}
      </Modal>

      <Modal
        title="Xác nhận xóa danh mục"
        open={isConfirmDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        confirmLoading={loading}
        maskClosable={false}
        centered
      >
        {categoryToDelete && (
          <p>Bạn có chắc chắn muốn xóa danh mục <strong>{categoryToDelete.categoryName}</strong> (Mã: {categoryToDelete.categoryId}) không?</p>
        )}
      </Modal>

      <Table
        bordered
        columns={columns}
        dataSource={categories}
        rowKey="categoryId"
        loading={loading && !isConfirmDeleteModalVisible}
        pagination={{
          pageSizeOptions: ["5", "10", "15", "20"],
          showSizeChanger: true,
          defaultPageSize: 5,
          size: "large",
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
          style: { marginTop: "24px" },
        }}
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default AdminCategories;