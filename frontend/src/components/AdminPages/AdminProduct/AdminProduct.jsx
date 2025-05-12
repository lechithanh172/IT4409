import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Space, Table, message, Input, Image, Tag } from "antd";
import {
  PlusCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import apiService from "../../../services/api";

const AdminProduct = () => {
  const [refresh, setRefresh] = useState(false);
  const [products, setProducts] = useState([]);
  const [modalChild, setModalChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] =
    useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productResponse, categoryResponse, brandResponse] =
          await Promise.all([
            apiService.getAllProducts(),
            apiService.getAllCategories(),
            apiService.getAllBrands(),
          ]);

        const rawProducts = productResponse.data || [];
        const rawCategories = categoryResponse.data || [];
        const rawBrands = brandResponse.data || [];

        if (Array.isArray(rawCategories)) {
          setCategoriesList(rawCategories);
        } else {
          message.error("Không thể tải danh sách danh mục.");
          setCategoriesList([]);
        }
        if (Array.isArray(rawBrands)) {
          setBrandsList(rawBrands);
        } else {
          message.error("Không thể tải danh sách thương hiệu.");
          setBrandsList([]);
        }

        const categoryMap = Array.isArray(rawCategories)
          ? rawCategories.reduce((map, category) => {
              map[category.categoryId] = category.categoryName;
              return map;
            }, {})
          : {};

        const brandMap = Array.isArray(rawBrands)
          ? rawBrands.reduce((map, brand) => {
              map[brand.brandId] = { name: brand.brandName, logoUrl: brand.logoUrl };
              return map;
            }, {})
          : {};

        if (Array.isArray(rawProducts)) {
          const processedProducts = rawProducts.map((product) => {
            let parsedSpecs = [];
            if (product.specifications && typeof product.specifications === "string") {
              try {
                parsedSpecs = JSON.parse(product.specifications);
                if (!Array.isArray(parsedSpecs)) parsedSpecs = [];
              } catch (e) {
                parsedSpecs = [];
              }
            } else if (Array.isArray(product.specifications)) {
              parsedSpecs = product.specifications;
            }

            return {
              ...product,
              categoryName: categoryMap[product.categoryId] || `ID: ${product.categoryId}`,
              brandName: brandMap[product.brandId]?.name || `ID: ${product.brandId}`,
              totalStock: (product.variants || []).reduce(
                (sum, v) => sum + (v.stockQuantity || 0),
                0
              ),
              specifications: parsedSpecs,
              variants: product.variants || [],
            };
          });
          setProducts(processedProducts);
        } else {
          setProducts([]);
          message.error("Dữ liệu sản phẩm không hợp lệ.");
        }
      } catch (error) {
        message.error("Không thể tải dữ liệu. Vui lòng thử lại.");
        setProducts([]);
        setCategoriesList([]);
        setBrandsList([]);
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

  const handleReset = (clearFilters, confirm) => {
    clearFilters && clearFilters();
    setSearchText("");
    confirm();
    setSearchedColumn("");
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
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
          <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  const deleteProduct = async (productToDelete) => {
    if (!productToDelete || !productToDelete.productId) {
      message.error("ID sản phẩm không hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      await apiService.deleteProduct(productToDelete.productId);
      message.success(`Đã xóa: ${productToDelete.productName}`);
      onRefresh();
    } catch (error) {
      message.error(error.response?.data?.message || `Xóa thất bại: ${productToDelete.productName}`);
      setLoading(false);
    }
  };

  const showDeleteConfirmModal = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
    }
    setIsConfirmDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const columns = [
    {
      title: "Mã SP",
      dataIndex: "productId",
      key: "productId",
      width: 80,
      align: "center",
      sorter: (a, b) => a.productId - b.productId,
      ...getColumnSearchProps("productId", "mã SP"),
    },
    {
      title: "Ảnh",
      key: "image",
      width: 80,
      align: "center",
      render: (_, record) => {
        const img = record.variants?.[0]?.imageUrl;
        return img ? (
          <Image width={40} height={40} src={img} style={{ objectFit: "contain" }} preview={true} />
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      ...getColumnSearchProps("productName", "tên"),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
      sorter: (a, b) => (a.categoryName || "").localeCompare(b.categoryName || ""),
      ...getColumnSearchProps("categoryName", "danh mục"),
      ellipsis: true,
    },
    {
      title: "Thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
      width: 150,
      sorter: (a, b) => (a.brandName || "").localeCompare(b.brandName || ""),
      ...getColumnSearchProps("brandName", "thương hiệu"),
      ellipsis: true,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (text) =>
        text ? text.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "N/A",
      sorter: (a, b) => a.price - b.price,
      align: "right",
    },
    {
      title: "Tổng SL",
      dataIndex: "totalStock",
      key: "totalStock",
      width: 90,
      sorter: (a, b) => a.totalStock - b.totalStock,
      align: "center",
    },
    {
      title: "Giao nhanh",
      dataIndex: "supportRushOrder",
      key: "supportRushOrder",
      width: 100,
      align: "center",
      render: (s) =>
        s ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Có
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Không
          </Tag>
        ),
      filters: [
        { text: "Có", value: true },
        { text: "Không", value: false },
      ],
      onFilter: (v, r) => r.supportRushOrder === v,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (a) =>
        a ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng KD</Tag>
        ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Ngừng KD", value: false },
      ],
      onFilter: (v, r) => r.isActive === v,
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setModalChild(
                <EditProduct
                  product={record}
                  setModalChild={setModalChild}
                  handleRefresh={onRefresh}
                  categoriesList={categoriesList}
                  brandsList={brandsList}
                />
              );
            }}
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteFilled />}
            onClick={(e) => {
              e.stopPropagation();
              showDeleteConfirmModal(record);
            }}
            title="Xóa"
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
            setModalChild(
              <AddProduct
                closeModal={() => setModalChild(null)}
                onProductAdded={onRefresh}
                categoriesList={categoriesList}
                brandsList={brandsList}
              />
            )
          }
          icon={<PlusCircleFilled />}
        >
          Thêm sản phẩm
        </Button>
      </Space>

      <Modal
        title={
          modalChild?.type === AddProduct
            ? "Thêm Sản Phẩm Mới"
            : modalChild?.type === EditProduct
            ? "Chỉnh Sửa Sản Phẩm"
            : false
        }
        centered
        open={modalChild !== null}
        onCancel={() => setModalChild(null)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
      >
        {modalChild}
      </Modal>

      <Modal
        title="Xác nhận xóa sản phẩm"
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
        {productToDelete && (
          <p>
            Bạn có chắc chắn muốn xóa{" "}
            <strong>{productToDelete.productName}</strong> (Mã:{" "}
            {productToDelete.productId}) không?
          </p>
        )}
      </Modal>

      <Table
        bordered
        columns={columns}
        dataSource={products}
        rowKey="productId"
        loading={loading && !isConfirmDeleteModalVisible}
        pagination={{
          pageSizeOptions: ["5", "10", "15", "20", "50"],
          showSizeChanger: true,
          defaultPageSize: 5,
          size: "large",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
          style: { marginTop: "24px" },
        }}
        size="middle"
        scroll={{ x: 1300 }}
      />
    </div>
  );
};
export default AdminProduct;