package com.service;

import com.entity.Brand;
import com.entity.Category;
import com.entity.Product;
import com.entity.ProductVariant;
import com.entity.dto.ProductDTO;
import com.entity.dto.ProductVariantDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.repository.BrandRepository;
import com.repository.CategoryRepository;
import com.repository.ProductRepository;
import com.repository.ProductVariantRepository;
import com.request.ProductQuantityCheckRequest;
import com.request.ProductRequest;
import com.request.ProductVariantRequest;
import com.request.SearchFilterRequest;
import com.response.ProductQuantityCheckResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    public ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setSpecifications(product.getSpecifications());
        dto.setPrice(product.getPrice());
        dto.setWeight(product.getWeight());
        String category = categoryRepository.findByCategoryId(product.getCategoryId()).get().getCategoryName();

        String brand = brandRepository.findByBrandId(product.getBrandId()).get().getBrandName();
        dto.setCategoryName(category);
        dto.setBrandName(brand);
        dto.setSupportRushOrder(product.getSupportRushOrder());
        List<ProductVariantDTO> variantDTOs = product.getVariants().stream().map(variant -> {
            ProductVariantDTO vDto = new ProductVariantDTO();
            vDto.setVariantId(variant.getVariantId());
            vDto.setColor(variant.getColor());
            vDto.setDiscount(variant.getDiscountPercentage());
            vDto.setImageUrl(variant.getImageUrl());
            vDto.setStockQuantity(variant.getStockQuantity());
            return vDto;
        }).collect(Collectors.toList());

        dto.setVariants(variantDTOs);
        return dto;
    }

    public Product toEntity(ProductRequest request) {
        // Tạo Product
        Product product = new Product();
        if (request.getProductId() != null) {
            product.setProductId(request.getProductId());
        }
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setSpecifications(request.getSpecifications());
        product.setWeight(request.getWeight());
        product.setPrice(request.getPrice());
        Integer categoryId = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName()).get().getCategoryId();
        Integer brandId = brandRepository.findByBrandNameIgnoreCase(request.getBrandName()).get().getBrandId();

        product.setCategoryId(categoryId);
        product.setBrandId(brandId);
        product.setSupportRushOrder(request.getSupportRushOrder());

        List<ProductVariant> variants = request.getVariants().stream().map(variantReq -> {
            ProductVariant variant = new ProductVariant();
            variant.setVariantId(variantReq.getVariantId());
            variant.setColor(variantReq.getColor());
            variant.setDiscountPercentage(variantReq.getDiscountPercentage());
            variant.setStockQuantity(variantReq.getStockQuantity());
            variant.setImageUrl(variantReq.getImageUrl());
            variant.setProduct(product);
            return variant;
        }).collect(Collectors.toList());

        product.setVariants(variants);
        return product;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductByProductName(String productName) {
        return productRepository.findByProductName(productName).get();
    }

    public boolean addProduct(ProductRequest request) {
        if (productRepository.findByProductName(request.getProductName()).isPresent()) {
            return false;
        } else {
            Product product = toEntity(request);
            productRepository.save(product);
            return true;
        }
    }

    public boolean deleteProduct(Integer productId) {
        if (productRepository.findById(productId).isPresent()) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }
    public void updateProduct(ProductRequest request) {
        // Load product
        Product product = productRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        // Update basic info
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setSpecifications(request.getSpecifications());
        product.setWeight(request.getWeight());
        product.setPrice(request.getPrice());
        product.setSupportRushOrder(request.getSupportRushOrder());

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        // Update category and brand
        Integer categoryId = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"))
                .getCategoryId();

        Integer brandId = brandRepository.findByBrandNameIgnoreCase(request.getBrandName())
                .orElseThrow(() -> new EntityNotFoundException("Brand not found"))
                .getBrandId();

        product.setCategoryId(categoryId);
        product.setBrandId(brandId);

        // Handle variants
        if (request.getVariants() != null) {
            Set<Integer> updatedVariantIds = request.getVariants().stream()
                    .filter(v -> v.getVariantId() != null)
                    .map(ProductVariantRequest::getVariantId)
                    .collect(Collectors.toSet());

            // Remove variants not in request
            product.getVariants().removeIf(v -> !updatedVariantIds.contains(v.getVariantId()));

            // Create map for existing variants
            Map<Integer, ProductVariant> existingVariants = product.getVariants().stream()
                    .collect(Collectors.toMap(ProductVariant::getVariantId, Function.identity()));
            for(ProductVariant productVariant : existingVariants.values()) {
            }
            // Update or create variants
            for (ProductVariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = variantReq.getVariantId() != null ?
                        existingVariants.get(variantReq.getVariantId()) : null;
                if (variant == null) {
                    variant = new ProductVariant();
                    variant.setProduct(product);
                    product.getVariants().add(variant);
                }
                variant.setColor(variantReq.getColor());
                variant.setImageUrl(variantReq.getImageUrl());
                variant.setStockQuantity(variantReq.getStockQuantity());
                variant.setDiscountPercentage(variantReq.getDiscountPercentage());
            }
        }
        productRepository.save(product);
    }

    public ProductDTO getProductById(Integer productId) {
        if (productRepository.findById(productId).isPresent()) {
            return toDTO(productRepository.findById(productId).get());
        }
        return null;
    }

    public List<ProductDTO> getProductsByCategory(String categoryName) {
        Optional<Category> category = categoryRepository.findByCategoryNameIgnoreCase(categoryName);
        if (category.isPresent()) {
            List<Product> products = productRepository.findByCategoryId(category.get().getCategoryId());
            List<ProductDTO> productDTOs = new ArrayList<>();
            for (Product product : products) {
                ProductDTO dto = toDTO(product);
                productDTOs.add(dto);
            }
            return productDTOs;
        } else return null;

    }
    public List<ProductDTO> getProductByBrand(String brandName) {
        Optional<Brand> brand = brandRepository.findByBrandNameIgnoreCase(brandName);
        if (brand.isPresent()) {
            List<Product> products = productRepository.findByBrandId(brand.get().getBrandId());
            List<ProductDTO> productDTOs = new ArrayList<>();
            for (Product product : products) {
                ProductDTO dto = toDTO(product);
                productDTOs.add(dto);
            }
            return productDTOs;
        } else return null;

    }

    public List<ProductDTO> searchProductsByName(String search) {

        List<Product> products = productRepository.findByProductNameContainingIgnoreCase(search);
        List<ProductDTO> productDTOs = new ArrayList<>();
        for (Product product : products) {
            ProductDTO dto = toDTO(product);
            productDTOs.add(dto);
        }
        return productDTOs;
    }

    public List<ProductDTO> getProductByCategoryAndBrand(String categoryName, String brandName) {
        Integer categoryId = categoryRepository.findByCategoryNameIgnoreCase(categoryName).get().getCategoryId();
        Integer brandId = categoryRepository.findByCategoryNameIgnoreCase(categoryName).get().getCategoryId();


        List<Product> products = productRepository.findProductsByCategoryIdAndBrandId(categoryId, brandId);
        List<ProductDTO> productDTOs = new ArrayList<>();
        for (Product product : products) {
            ProductDTO dto = toDTO(product);
            productDTOs.add(dto);
        }
        return productDTOs;
    }

    public ProductQuantityCheckResponse checkProductQuantity(ProductQuantityCheckRequest request) {
        ProductQuantityCheckResponse response = new ProductQuantityCheckResponse();
        Optional<ProductVariant> productVariant = productVariantRepository.findByVariantIdAndProduct_ProductId(request.getVariantId(), request.getProductId());
        if (productVariant.isPresent()) {
            response.setProductId(request.getProductId());
            response.setVariantId(request.getVariantId());
            response.setQuantity(productVariant.get().getStockQuantity());
            return response;
        } else return null;
    }

    public boolean deleteVariant(Integer variantId) {
        if (!productVariantRepository.existsById(variantId)) {
            return false;
        }
        productVariantRepository.deleteById(variantId);
        return true;
    }

    private String normalize(String input) {
        if (input == null) return "";

        // Chuẩn hóa cơ bản
        String normalized = input.trim().toLowerCase().replaceAll("\\s+", " ");
        normalized = normalized.replaceAll("(?<=\\d)(gb|tb|mb|hz)", " $1");

        // Nếu bắt đầu bằng Apple → giữ nguyên sau chuẩn hóa
        if (normalized.startsWith("apple")) {
            return normalized;
        }

        // Nếu bắt đầu bằng Intel hoặc AMD → lấy 3 từ đầu
        if (normalized.startsWith("intel") || normalized.startsWith("amd")) {
            String[] parts = normalized.split("\\s+");
            int limit = Math.min(parts.length, 3);
            return String.join(" ", Arrays.copyOfRange(parts, 0, limit));
        }

        // Xử lý đặc biệt cho RAM / Storage như cũ
        if (normalized.matches("^\\d+\\s+(gb|tb|mb|hz)\\b.*")) {
            String[] parts = normalized.split("\\s+");
            if (parts.length >= 2 && parts[1].matches("gb|tb|hz")) {
                normalized = parts[0] + " " + parts[1];
            }
        }

        return normalized;
    }


    // Cache để tăng hiệu suất
    private final Map<String, List<Map<String, String>>> specCache = new ConcurrentHashMap<>();


    public List<ProductDTO> searchProductsWithFilter(SearchFilterRequest request) {
        List<Product> products = new ArrayList<>();
        if(request.getLowerBound() == null) request.setLowerBound(0L);
        if(request.getUpperBound() == null) request.setUpperBound((long) 1e15);
        if(request.getBrandName() != null) request.setBrandId(brandRepository.findByBrandNameIgnoreCase(request.getBrandName()).get().getBrandId());
        if(request.getType().equalsIgnoreCase("smartphone")) products = getProductsWithFilterSmartPhone(request);
        if(request.getType().equalsIgnoreCase("laptop")) products = getProductsWithFilterLaptop(request);
        List<ProductDTO> productDTOs = new ArrayList<>();
        for (Product product : products) {
            productDTOs.add(toDTO(product));
        }
        return productDTOs;

    }

    // deepseek laptop & smartphone----------------------------------------------------------------------------------------

    public List<Product> getProductsWithFilterLaptop(SearchFilterRequest request) {
        // Lấy tất cả sản phẩm thuộc danh mục Laptop (categoryId = 1)
        List<Product> allProducts = productRepository.findByCategoryId(1);
        List<Product> filteredProducts = new ArrayList<>();
        // Duyệt qua từng sản phẩm trong danh sách
        for (Product product : allProducts) {
            if(request.getBrandId() != null && !Objects.equals(product.getBrandId(), request.getBrandId())) continue;
            if(product.getPrice() > request.getUpperBound() || product.getPrice() < request.getLowerBound()) continue;
            // Lấy thông số kỹ thuật của sản phẩm
            String specifications = product.getSpecifications();

            // Kiểm tra xem sản phẩm có khớp với các tiêu chí filter không
            boolean isMatch = matchSpecificationsLaptop(specifications, request);

            // Nếu khớp thì thêm vào danh sách kết quả
            if (isMatch) {
                filteredProducts.add(product);
            }
        }

        // Trả về danh sách sản phẩm đã lọc
        return filteredProducts;
    }

    public List<Product> getProductsWithFilterSmartPhone(SearchFilterRequest request) {
        List<Product> allProducts = productRepository.findByCategoryId(3);
        List<Product> filteredProducts = new ArrayList<>();

        // Duyệt qua từng sản phẩm trong danh sách
        for (Product product : allProducts) {
            if(request.getBrandId() != null && !Objects.equals(product.getBrandId(), request.getBrandId())) continue;
            if(product.getPrice() > request.getUpperBound() || product.getPrice() < request.getLowerBound()) continue;
            // Lấy thông số kỹ thuật của sản phẩm
            String specifications = product.getSpecifications();

            // Kiểm tra xem sản phẩm có khớp với các tiêu chí filter không
            boolean isMatch = matchSpecificationsSmartPhone(specifications, request);

            // Nếu khớp thì thêm vào danh sách kết quả
            if (isMatch) {
                filteredProducts.add(product);
            }
        }

        // Trả về danh sách sản phẩm đã lọc
        return filteredProducts;
    }

    private boolean matchSpecificationsLaptop(String jsonSpec, SearchFilterRequest request) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> specs = mapper.readValue(jsonSpec, new TypeReference<List<Map<String, String>>>() {});

            // Kiểm tra CPU (nếu request có danh sách CPU)
            boolean cpuMatch = request.getCpu() == null || request.getCpu().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList(
                                    "Công nghệ CPU", "CPU", "Processor", "Bộ vi xử lý", "Chip", "Chip xử lý", "Vi xử lý"),
                            request.getCpu(), FieldType.CPU);

            // Kiểm tra RAM (nếu request có danh sách RAM)
            boolean memoryMatch = request.getMemory() == null || request.getMemory().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList(
                                    "RAM", "Bộ nhớ RAM", "Dung lượng RAM", "Memory", "System Memory"),
                            request.getMemory(), FieldType.MEMORY);

            // Kiểm tra Storage (nếu request có danh sách Storage)
            boolean storageMatch = request.getStorage() == null || request.getStorage().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList(
                                    "Ổ cứng", "Storage", "Bộ nhớ trong", "SSD", "HDD", "Dung lượng lưu trữ", "Hard Drive", "Loại ổ cứng"),
                            request.getStorage(), FieldType.STORAGE);

            // Kiểm tra Refresh Rate (giữ nguyên dạng String)
            boolean refreshRateMatch = request.getRefreshRate() == null || request.getRefreshRate().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList("Tần số quét", "Tốc độ làm tươi", "Refresh rate", "Tốc độ làm mới"),
                            request.getRefreshRate(), FieldType.REFRESH_RATE);

            return cpuMatch && memoryMatch && storageMatch && refreshRateMatch;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean matchSpecificationsSmartPhone(String jsonSpec, SearchFilterRequest request) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> specs = mapper.readValue(jsonSpec, new TypeReference<List<Map<String, String>>>() {});

            // Kiểm tra RAM (nếu request có danh sách RAM)
            boolean memoryMatch = request.getMemory() == null || request.getMemory().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList("RAM", "Bộ nhớ RAM", "Dung lượng RAM"),
                            request.getMemory(), FieldType.MEMORY);

            // Kiểm tra Storage (nếu request có danh sách Storage)
            boolean storageMatch = request.getStorage() == null || request.getStorage().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList("Ổ cứng", "Dung lượng ổ cứng", "Bộ nhớ trong", "Lưu trữ", "Dung lượng lưu trữ"),
                            request.getStorage(), FieldType.STORAGE);

            // Kiểm tra Refresh Rate (nếu request có danh sách Refresh Rate)
            boolean refreshRateMatch = request.getRefreshRate() == null || request.getRefreshRate().isEmpty() ||
                    matchesAnyField(specs, Arrays.asList("Tần số quét", "Tốc độ làm tươi", "Refresh rate"),
                            request.getRefreshRate(), FieldType.REFRESH_RATE);

            return memoryMatch && storageMatch && refreshRateMatch;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean matchesAnyField(List<Map<String, String>> specs, List<String> titleList,
                                    List<String> expectedValues, FieldType fieldType) {
        if (expectedValues == null || expectedValues.isEmpty()) {
            return true;
        }

        // Chỉ cần khớp với 1 trong các giá trị expected là đủ
        for (String expectedValue : expectedValues) {
            if (matchesField(specs, titleList, expectedValue, fieldType)) {
                return true;
            }
        }
        return false;
    }

    enum FieldType {
        CPU,
        MEMORY,
        STORAGE,
        REFRESH_RATE,
    }

    private boolean matchesField(List<Map<String, String>> specs, List<String> titleList,
                                 String expectedValue, FieldType fieldType) {
        if (expectedValue == null || expectedValue.trim().isEmpty()) {
            return true;
        }

        String normalizedExpected = normalize(expectedValue);

        for (Map<String, String> spec : specs) {
            String specTitle = spec.get("title");
            String specContent = spec.get("content");
            if (specTitle != null && specContent != null) {
                for (String title : titleList) {
                    if (similarTo(title, specTitle)) {
                        String normalizedContent = normalize(specContent);
                        switch (fieldType) {
                            case CPU:
                                return matchCpu(normalizedContent, normalizedExpected);
                            case MEMORY:
                                return matchMemory(normalizedContent, normalizedExpected);
                            case STORAGE:
                                return matchStorage(normalizedContent, normalizedExpected);
                            case REFRESH_RATE:
                                return matchRefreshRate(normalizedContent, normalizedExpected);
                            default:
                                return normalizedContent.equals(normalizedExpected);
                        }
                    }
                }
            }
        }
        return false;
    }

    private boolean matchCpu(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();
        return lowerContent.equals(lowerExpected);
    }

    private boolean matchMemory(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();
        return lowerContent.equals(lowerExpected);
    }

    private boolean matchStorage(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();

        return lowerContent.equals(lowerExpected);
    }

    private boolean matchRefreshRate(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();
        return lowerContent.equals(lowerExpected);
    }

    private boolean similarTo(String title1, String title2) {
        String norm1 = title1.toLowerCase();
        String norm2 = title2.toLowerCase();
        return norm1.equals(norm2);
    }
}
