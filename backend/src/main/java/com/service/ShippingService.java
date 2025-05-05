package com.service;

import com.entity.Product;
import com.enums.DeliveryMethod;
import com.repository.ProductRepository;
import com.request.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShippingService {
    @Autowired
    private OrderService orderService;
    @Autowired
    private ProductRepository productRepository;

    private static final List<String> hanoiInnerDistricts = Arrays.asList(
            "QUẬN BA ĐÌNH", "BA ĐÌNH",
            "QUẬN HOÀN KIẾM", "HOÀN KIẾM",
            "QUẬN TÂY HỒ", "TÂY HỒ",
            "QUẬN LONG BIÊN", "LONG BIÊN",
            "QUẬN CẦU GIẤY", "CẦU GIẤY",
            "QUẬN ĐỐNG ĐA", "ĐỐNG ĐA",
            "QUẬN HAI BÀ TRƯNG", "HAI BÀ TRƯNG",
            "QUẬN HOÀNG MAI", "HOÀNG MAI",
            "QUẬN THANH XUÂN", "THANH XUÂN",
            "QUẬN HÀ ĐÔNG", "HÀ ĐÔNG",
            "QUẬN BẮC TỪ LIÊM", "BẮC TỪ LIÊM",
            "QUẬN NAM TỪ LIÊM", "NAM TỪ LIÊM"
    );

    private static final List<String> hcmcInnerDistricts = Arrays.asList(
            "QUẬN 1", "Q1", "Q.1", "Q 1",
            "QUẬN 3", "Q3", "Q.3", "Q 3",
            "QUẬN 4", "Q4", "Q.4", "Q 4",
            "QUẬN 5", "Q5", "Q.5", "Q 5",
            "QUẬN 6", "Q6", "Q.6", "Q 6",
            "QUẬN 7", "Q7", "Q.7", "Q 7",
            "QUẬN 8", "Q8", "Q.8", "Q 8",
            "QUẬN 10", "Q10", "Q.10", "Q 10",
            "QUẬN 11", "Q11", "Q.11", "Q 11",
            "QUẬN 12", "Q12", "Q.12", "Q 12",
            "QUẬN BÌNH THẠNH", "BÌNH THẠNH",
            "QUẬN GÒ VẤP", "GÒ VẤP",
            "QUẬN PHÚ NHUẬN", "PHÚ NHUẬN",
            "QUẬN TÂN BÌNH", "TÂN BÌNH",
            "QUẬN TÂN PHÚ", "TÂN PHÚ",
            "QUẬN BÌNH TÂN", "BÌNH TÂN"
    );

    public static final List<String> majorCities = Arrays.asList(
            "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"
    );

    public static final List<String> northernProvinces = Arrays.asList(
            "Hà Giang", "Cao Bằng", "Bắc Kạn", "Lạng Sơn", "Tuyên Quang", "Yên Bái",
            "Thái Nguyên", "Phú Thọ", "Bắc Giang", "Quảng Ninh", "Lào Cai", "Điện Biên",
            "Lai Châu", "Sơn La", "Hòa Bình", "Hưng Yên", "Thái Bình", "Hà Nam",
            "Nam Định", "Ninh Bình", "Vĩnh Phúc", "Bắc Ninh"
    );

    public static final List<String> centralProvinces = Arrays.asList(
            "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế",
            "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận",
            "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng"
    );

    public static final List<String> southernProvinces = Arrays.asList(
            "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu",
            "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp",
            "An Giang", "Kiên Giang", "Cà Mau", "Hậu Giang", "Sóc Trăng", "Bạc Liêu"
    );
    public Integer calculateShippingFee(String shippingAddress, double weight, DeliveryMethod deliveryMethod) {
        String[] adress = shippingAddress.split(", ");
        String province = adress[2];
        String district = adress[1];
        String region = detectRegion(province, district);
        String deliveryMethodName = deliveryMethod.name();
        return calculateFeeByWeightAndRegion(weight, region, deliveryMethodName);
    }

    public static String detectRegion(String province, String district) {
        if (province == null) return "OTHER";

        String upperAddress = province.toUpperCase();
        if(majorCities.contains(province)) {
            if(isHanoiOrHCMCInnerCity(district)) return "INNER_MAJOR_CITY";
            else return "MAJOR_CITY";
        }
        if(northernProvinces.contains(province)) return "NORTHERN";
        if(centralProvinces.contains(province)) return "CENTRAL";
        if(southernProvinces.contains(province)) return "SOUTHERN";

        return "OTHER";
    }
    private static final Map<String, Integer> baseFeeByRegion = Map.of(
            "INNER_MAJOR_CITY", 10000,
            "MAJOR_CITY", 15000,
            "NORTHERN", 20000,
            "CENTRAL", 25000,
            "SOUTHERN", 22000,
            "OTHER", 30000
    );

    private static final Map<String, Integer> additionalFeeByRegion = Map.of(
            "INNER_MAJOR_CITY", 3000,
            "MAJOR_CITY", 5000,
            "NORTHERN", 7000,
            "CENTRAL", 9000,
            "SOUTHERN", 8000,
            "OTHER", 10000
    );

    private static final Map<String, Double> deliveryMethodFactor = Map.of(
            "EXPRESS", 1.5,
            "STANDARD", 1.0
    );

    public static boolean isHanoiOrHCMCInnerCity(String district) {
        if (district == null) return false;
        String normalized = district.toLowerCase();

        return hanoiInnerDistricts.contains(normalized) || hcmcInnerDistricts.contains(normalized);
    }

    public Double totalWeightCalculate(Item[] items) {
        double weight = 0;
        for(Item item : items) {
            Optional<Product> product = productRepository.findById(item.getProductId());
            if(product.isPresent()) {
                weight += product.get().getWeight() * item.getQuantity();
            }
            else return null;
        }
        return weight;
    }
    public static int calculateFeeByWeightAndRegion(
            double weight,
            String region,
            String deliveryMethod
    ) {
        int baseFee = baseFeeByRegion.getOrDefault(region, baseFeeByRegion.get("OTHER"));
        int additionalFeeRate = additionalFeeByRegion.getOrDefault(region, additionalFeeByRegion.get("OTHER"));

        int fee = baseFee;

        // Phí cho cân nặng vượt 1kg
        if (weight > 1) {
            double additionalWeight = weight - 1;
            int extraUnits = (int) Math.ceil(additionalWeight / 0.5);
            fee += extraUnits * additionalFeeRate;
        }

        // Hệ số nhân theo phương thức giao hàng
        double factor;
        if ("EXPRESS".equalsIgnoreCase(deliveryMethod)) {
            factor = deliveryMethodFactor.get("EXPRESS");
        } else {
            factor = deliveryMethodFactor.getOrDefault(deliveryMethod.toUpperCase(), 1.0);
        }

        return (int) Math.round(fee * factor);
    }
}
