package com.service;

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

//    public void updateProduct(ProductRequest request) {
//        Product product = productRepository.findByProductId(request.getProductId()).get();
//        product.setProductName(request.getProductName());
//        product.setDescription(request.getDescription());
//        product.setSpecifications(request.getSpecifications());
//        product.setWeight(request.getWeight());
//        product.setPrice(request.getPrice());
//        product.setSupportRushOrder(request.getSupportRushOrder());
//        if (request.getIsActive() != null) {
//            product.setIsActive(request.getIsActive());
//        }
//
//        Integer categoryId = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName()).get().getCategoryId();
//        Integer brandId = brandRepository.findByBrandNameIgnoreCase(request.getBrandName()).get().getBrandId();
//        product.setCategoryId(categoryId);
//        product.setBrandId(brandId);
//        product.setUpdatedAt(LocalDateTime.now());
//
//        Set<Integer> updatedVariantIds = request.getVariants().stream().filter(v -> v.getVariantId() != null).map(ProductVariantRequest::getVariantId).collect(Collectors.toSet());
//
//
//        Iterator<ProductVariant> iterator = product.getVariants().iterator();
//        while (iterator.hasNext()) {
//            ProductVariant variant = iterator.next();
//            if (!updatedVariantIds.contains(variant.getVariantId())) {
//                iterator.remove();
//            }
//        }
//
//        for (ProductVariantRequest variantReq : request.getVariants()) {
//            ProductVariant variant = product.getVariants().stream().filter(v -> v.getVariantId() != null && v.getVariantId().equals(variantReq.getVariantId())).findFirst().orElseGet(() -> {
//                ProductVariant newVariant = new ProductVariant();
//                newVariant.setProduct(product);
//                product.getVariants().add(newVariant);
//                return newVariant;
//            });
//            variant.setColor(variantReq.getColor());
//            variant.setImageUrl(variantReq.getImageUrl());
//            variant.setStockQuantity(variantReq.getStockQuantity());
//            variant.setDiscountPercentage(variantReq.getDiscountPercentage());
//        }
//        productRepository.save(product);
//    }
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
        if(request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

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
                System.out.println(productVariant);
                System.out.println("haha");
            }
            // Update or create variants
            for (ProductVariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = variantReq.getVariantId() != null ?
                        existingVariants.get(variantReq.getVariantId()) : null;
                System.out.println(variantReq);
                if (variant == null) {
                    variant = new ProductVariant();
                    variant.setProduct(product);
                    product.getVariants().add(variant);
                }
                System.out.println(variant.getVariantId());
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
        return input.trim().toLowerCase()
                .replaceAll("\\s+", " ")
                .replaceAll("([0-9]+)\\s*([a-zà-ỹ]+)", "$1$2"); // Xóa khoảng trắng giữa số và đơn vị
    }

    private boolean matchesField(List<Map<String, String>> specs, List<String> titleList, String expectedValue) {
        if (expectedValue == null || expectedValue.trim().isEmpty()) {
            return true;
        }

        String normalizedExpected = normalize(expectedValue);

        for (Map<String, String> spec : specs) {
            String specTitle = spec.get("title");
            String specContent = spec.get("content");

            if (specTitle != null && specContent != null) {
                for (String title : titleList) {
                    if (title.equalsIgnoreCase(specTitle)) {
                        String normalizedContent = normalize(specContent);
                        // Xử lý chung
                        if (normalizedContent.equals(normalizedExpected) ||
                                normalizedContent.contains(normalizedExpected) ||
                                normalizedExpected.contains(normalizedContent)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private boolean isBatteryField(List<String> titleList) {
        List<String> batteryTitles = Arrays.asList("Thông tin Pin", "Pin", "Dung lượng pin", "Thời lượng pin", "Dung lượng");
        return titleList.stream().anyMatch(batteryTitles::contains);
    }

    private boolean isBatteryMatch(String content, String expected) {
        try {
            // Xử lý trường hợp dung lượng pin (vd: "4422 mah" vs "4.422 mah")
            String numContent = content.replaceAll("[^0-9]", "");
            String numExpected = expected.replaceAll("[^0-9]", "");
            return numContent.equals(numExpected);
        } catch (Exception e) {
            return false;
        }
    }

    // Cache để tăng hiệu suất
    private final Map<String, List<Map<String, String>>> specCache = new ConcurrentHashMap<>();

    private List<Map<String, String>> parseSpecifications(String jsonSpec) {
        return specCache.computeIfAbsent(jsonSpec, k -> {
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(jsonSpec, new TypeReference<List<Map<String, String>>>() {});
            } catch (Exception e) {
                return Collections.emptyList();
            }
        });
    }

    public List<Product> getProductsWithFilterSmartPhone(SearchFilterRequest request) {
        List<Product> allProducts = productRepository.findByCategoryId(3);
        List<Product> filteredProducts = new ArrayList<>();

        // Duyệt qua từng sản phẩm trong danh sách
        for (Product product : allProducts) {
            if(product.getPrice() > request.getUpperBound() || product.getPrice() < request.getLowerBound()) continue;
            // Lấy thông số kỹ thuật của sản phẩm
            String specifications = product.getSpecifications();

            // Kiểm tra xem sản phẩm có khớp với các tiêu chí filter không
            boolean isMatch = matchSpecificationsSmartPhone(specifications, request);

            // Nếu khớp thì thêm vào danh sách kết quả
            if (isMatch) {
//                System.out.println("hehehe");
                filteredProducts.add(product);
            }
        }

        // Trả về danh sách sản phẩm đã lọc
        return filteredProducts;
    }


    public List<ProductDTO> searchProductsWithFilter(SearchFilterRequest request) {
        List<Product> products = new ArrayList<>();
        if(request.getType().equalsIgnoreCase("smartphone")) products = getProductsWithFilterSmartPhone(request);
        if(request.getType().equalsIgnoreCase("laptop")) products = getProductsWithFilterLaptop(request);
        if(request.getLowerBound() == null) request.setLowerBound(0L);
        if(request.getUpperBound() == null) request.setUpperBound((long) 1e15);
        List<ProductDTO> productDTOs = new ArrayList<>();
        for (Product product : products) {
            productDTOs.add(toDTO(product));
        }
        return productDTOs;

    }

    // deepseek laptop----------------------------------------------------------------------------------------

    public List<Product> getProductsWithFilterLaptop(SearchFilterRequest request) {
        // Lấy tất cả sản phẩm thuộc danh mục Laptop (categoryId = 1)
        List<Product> allProducts = productRepository.findByCategoryId(1);
        List<Product> filteredProducts = new ArrayList<>();

        // Duyệt qua từng sản phẩm trong danh sách
        for (Product product : allProducts) {
            if(product.getPrice() > request.getUpperBound() || product.getPrice() < request.getLowerBound()) continue;
            // Lấy thông số kỹ thuật của sản phẩm
            String specifications = product.getSpecifications();

            // Kiểm tra xem sản phẩm có khớp với các tiêu chí filter không
            boolean isMatch = matchSpecificationsLaptop(specifications, request);

            // Nếu khớp thì thêm vào danh sách kết quả
            if (isMatch) {
                System.out.println("hehehe");
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

            return matchesField(specs, Arrays.asList(
                            "Công nghệ CPU", "CPU", "Processor", "Bộ vi xử lý", "Chip", "Chip xử lý", "Vi xử lý"),
                    request.getCpu(), FieldType.CPU) &&

                    matchesField(specs, Arrays.asList(
                                    "RAM", "Bộ nhớ RAM", "Dung lượng RAM", "Memory", "System Memory"),
                            request.getMemory(), FieldType.MEMORY) &&

                    matchesField(specs, Arrays.asList(
                                    "Ổ cứng", "Storage", "Bộ nhớ trong", "SSD", "HDD", "Dung lượng lưu trữ", "Hard Drive", "Loại ổ cứng"),
                            request.getStorage(), FieldType.STORAGE) &&

//                    matchesField(specs, Arrays.asList(
//                                    "Màn hình", "Kích thước màn hình", "Display", "Screen Size", "Màn hình rộng"),
//                            request.getDisplaySize(), FieldType.DISPLAY_SIZE) &&
//
//                    matchesField(specs, Arrays.asList(
//                                    "Độ phân giải", "Resolution", "Screen Resolution"),
//                            request.getDisplayResolution(), FieldType.DISPLAY_RESOLUTION) &&
//
//                    matchesField(specs, Arrays.asList(
//                                    "Card màn hình", "GPU", "VGA", "Đồ họa", "Graphics", "Graphics Card", "Card đồ họa"),
//                            request.getGraphicsCard(), FieldType.GRAPHICS) &&
//
//                    matchesField(specs, Arrays.asList(
//                                    "Hệ điều hành", "OS", "Operating System"),
//                            request.getOperatingSystem(), FieldType.OS) &&
//
//                    matchesField(specs, Arrays.asList(
//                                    "Pin", "Battery", "Thời lượng pin", "Dung lượng pin", "Battery Life", "Thông tin Pin"),
//                            request.getBattery(), FieldType.BATTERY) &&
//
//                    matchesField(specs, Arrays.asList(
//                                    "Khối lượng", "Trọng lượng", "Weight"),
//                            request.getWeight(), FieldType.WEIGHT) &&

                    matchesField(specs, Arrays.asList(
                                    "Tần số quét", "Refresh rate"),
                            request.getRefreshRate(), FieldType.REFRESH_RATE);
        } catch (Exception e) {
            return false;
        }
    }

    enum FieldType {
        CPU,
        MEMORY,
        STORAGE,
        REFRESH_RATE,
//        DISPLAY_RESOLUTION,
//        DISPLAY_SIZE,
//        GRAPHICS,
//        OS,
//        BATTERY,
//        WEIGHT
    }

    private boolean matchesField(List<Map<String, String>> specs, List<String> titleList,
                                 String expectedValue, FieldType fieldType) {
        if (expectedValue == null || expectedValue.trim().isEmpty()) {
            return true;
        }

        String normalizedExpected = normalize(expectedValue);

        for (Map<String, String> spec : specs) {
//            System.out.println(spec.toString());
            String specTitle = spec.get("title");
            String specContent = spec.get("content");
            if (specTitle != null && specContent != null) {
                for (String title : titleList) {
                    if (similarTo(title, specTitle)) {
                        System.out.println(spec  + specTitle);
                        String normalizedContent = normalize(specContent);
                        System.out.println(normalizedContent + " " + normalizedExpected + spec);
                        switch (fieldType) {
                            case CPU:
                                return matchCpu(normalizedContent, normalizedExpected);
                            case MEMORY:
                                return matchMemory(normalizedContent, normalizedExpected);
                            case STORAGE:
                                return matchStorage(normalizedContent, normalizedExpected);
//                            case DISPLAY_SIZE:
//                                return matchDisplaySize(normalizedContent, normalizedExpected);
//                            case DISPLAY_RESOLUTION:
//                                return matchDisplayResolution(normalizedContent, normalizedExpected);
//                            case GRAPHICS:
//                                return matchGraphics(normalizedContent, normalizedExpected);
//                            case OS:
//                                return matchOs(normalizedContent, normalizedExpected);
//                            case BATTERY:
//                                return matchBattery(normalizedContent, normalizedExpected);
//                            case WEIGHT:
//                                return matchWeight(normalizedContent, normalizedExpected);
                            case REFRESH_RATE:
                                return matchRefreshRate(normalizedContent, normalizedExpected);
                            default:
                                return normalizedContent.equals(normalizedExpected) ||
                                        normalizedContent.contains(normalizedExpected) ||
                                        normalizedExpected.contains(normalizedContent);
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
        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
    }

    private boolean matchMemory(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();
        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
    }

    private boolean matchStorage(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();

        // Xử lý đặc biệt cho chuyển đổi TB sang GB
        if (lowerContent.contains("tb") && !lowerExpected.contains("tb")) {
            String tbValue = lowerContent.replaceAll("[^0-9.]", "");
            String gbValue = lowerExpected.replaceAll("[^0-9.]", "");
            try {
                double tb = Double.parseDouble(tbValue);
                double gb = Double.parseDouble(gbValue);
                return Math.abs(tb * 1000 - gb) < 1; // Sai số nhỏ hơn 1GB
            } catch (NumberFormatException e) {
                return false;
            }
        }

        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
    }

//    private boolean matchDisplaySize(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }
//
//    private boolean matchDisplayResolution(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }
//
//    private boolean matchGraphics(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }
//
//    private boolean matchOs(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }
//
//    private boolean matchBattery(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }
//
//    private boolean matchWeight(String content, String expected) {
//        String lowerContent = content.toLowerCase();
//        String lowerExpected = expected.toLowerCase();
//        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
//    }

    private boolean matchRefreshRate(String content, String expected) {
        String lowerContent = content.toLowerCase();
        String lowerExpected = expected.toLowerCase();
        return lowerContent.contains(lowerExpected) || lowerExpected.contains(lowerContent);
    }

    private boolean similarTo(String title1, String title2) {
        String norm1 = normalize(title1);
        String norm2 = normalize(title2);
        return norm1.equals(norm2) ||
                norm1.contains(norm2) ||
                norm2.contains(norm1) ||
                norm1.replaceAll("[^a-z0-9]", "").equals(norm2.replaceAll("[^a-z0-9]", ""));
    }

    // deepseek smartphone----------------------------------------------------------------------------------------

    private boolean matchSpecificationsSmartPhone(String jsonSpec, SearchFilterRequest request) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> specs = mapper.readValue(jsonSpec, new TypeReference<List<Map<String, String>>>() {});

            return matchesField(specs, Arrays.asList("RAM", "Bộ nhớ RAM", "Dung lượng RAM"),
                    request.getMemory(), FieldType.MEMORY) &&

                    matchesField(specs, Arrays.asList("Ổ cứng", "Dung lượng ổ cứng", "Bộ nhớ trong", "Lưu trữ", "Dung lượng lưu trữ"),
                            request.getStorage(), FieldType.STORAGE) &&

                    matchesField(specs, Arrays.asList("Tần số quét", "Tốc độ làm tươi", "Refresh rate"),
                            request.getRefreshRate(), FieldType.REFRESH_RATE);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean matchesFieldSmartphone(List<Map<String, String>> specs, List<String> titleList,
                                 String expectedValue, FieldType fieldType) {
        if (expectedValue == null || expectedValue.trim().isEmpty()) {
            return true;
        }

        String lowerExpected = expectedValue.toLowerCase();

        for (Map<String, String> spec : specs) {
            String specTitle = spec.get("title");
            String specContent = spec.get("content");

            if (specTitle != null && specContent != null) {
                for (String title : titleList) {
                    if (specTitle.toLowerCase().contains(title.toLowerCase()) ||
                            title.toLowerCase().contains(specTitle.toLowerCase())) {

                        String lowerContent = specContent.toLowerCase();

                        switch (fieldType) {
                            case MEMORY:
                                return matchMemory(lowerContent, lowerExpected);
                            case STORAGE:
                                return matchStorage(lowerContent, lowerExpected);
                            case REFRESH_RATE:
                                return matchRefreshRate(lowerContent, lowerExpected);
                        }
                    }
                }
            }
        }
        return false;
    }



}
