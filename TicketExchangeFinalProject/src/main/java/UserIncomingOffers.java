import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@WebServlet("/UserIncomingOffers")
public class UserIncomingOffers extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int userID = Integer.parseInt(request.getParameter("user_id"));
            List<TicketOffer> ticketOffers = getTicketOffersBySellerId(userID);

            if (ticketOffers.isEmpty()) {
                out.println("[]");
                return;
            }

            JsonArray ticketsJsonArray = getTicketsJson(ticketOffers);
            out.println(ticketsJsonArray.toString());

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    private List<TicketOffer> getTicketOffersBySellerId(int sellerID) throws SQLException {
        List<TicketOffer> ticketOffers = new ArrayList<>();

        // Modified SQL query to include t.user_id as sellerID
        String sql = "SELECT o.ticket_id, o.buyer_id, t.eventName, t.startDate, t.endDate, t.ticketPrice, t.additionalInfo, t.negotiable, t.numTickets, t.status, t.user_id AS seller_id "
                   + "FROM offers o "
                   + "JOIN tickets t ON o.ticket_id = t.ticketID "
                   + "WHERE o.seller_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, sellerID);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int ticketId = rs.getInt("ticket_id");
                    int buyerId = rs.getInt("buyer_id");
                    String eventName = rs.getString("eventName");
                    int startDate = rs.getInt("startDate");
                    int endDate = rs.getInt("endDate");
                    double ticketPrice = rs.getDouble("ticketPrice");
                    String additionalInfo = rs.getString("additionalInfo");
                    boolean negotiable = rs.getBoolean("negotiable");
                    int numTickets = rs.getInt("numTickets");
                    int status = rs.getInt("status");
                    int sellerId = rs.getInt("seller_id"); // Extracting seller_id from tickets table

                    // Get buyer's contact info
                    String buyerUsername = getBuyerUsername(buyerId);
                    String buyerPhone = getBuyerPhone(buyerId);
                    String buyerSocials = getBuyerSocials(buyerId);

                    // Create TicketOffer with the extracted sellerId
                    ticketOffers.add(new TicketOffer(ticketId, buyerId, sellerId, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status,
                        buyerUsername, buyerPhone, buyerSocials));
                }
            }
        }
        return ticketOffers;
    }

    private String getBuyerUsername(int buyerId) throws SQLException {
        String sql = "SELECT fullname FROM users WHERE user_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("fullname");
                }
            }
        }
        return "";
    }

    private String getBuyerPhone(int buyerId) throws SQLException {
        String sql = "SELECT phone_number FROM users WHERE user_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("phone_number");
                }
            }
        }
        return "";
    }

    private String getBuyerSocials(int buyerId) throws SQLException {
        String sql = "SELECT socials FROM users WHERE user_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("socials");
                }
            }
        }
        return "";
    }

    private JsonArray getTicketsJson(List<TicketOffer> ticketOffers) {
        JsonArray ticketsJsonArray = new JsonArray();

        for (TicketOffer offer : ticketOffers) {
            JsonObject ticketJson = new JsonObject();
            ticketJson.addProperty("ticketID", offer.getTicketId());
            ticketJson.addProperty("eventName", offer.getEventName());
            ticketJson.addProperty("ticketPrice", offer.getTicketPrice());
            ticketJson.addProperty("additionalInfo", offer.getAdditionalInfo());
            ticketJson.addProperty("negotiable", offer.isNegotiable());
            ticketJson.addProperty("numTickets", offer.getNumTickets());
            ticketJson.addProperty("status", offer.getStatus());
            ticketJson.addProperty("startDate", formatDate(offer.getStartDate()));
            ticketJson.addProperty("endDate", formatDate(offer.getEndDate()));
            ticketJson.addProperty("buyerUsername", offer.getBuyerUsername());
            ticketJson.addProperty("buyerPhone", offer.getBuyerPhone());
            ticketJson.addProperty("buyerSocials", offer.getBuyerSocials());
            ticketJson.addProperty("sellerID", offer.getSellerId()); 
            ticketJson.addProperty("buyerID", offer.getBuyerId()); 

            ticketsJsonArray.add(ticketJson);
        }

        return ticketsJsonArray;
    }

    private String formatDate(int timestamp) {
        try {
            return dateFormat.format(new java.util.Date((long) timestamp * 1000));
        } catch (Exception e) {
            return "Invalid Date";
        }
    }

    // Inner class to hold ticket and buyer information
    private static class TicketOffer {
        private int ticketId;
        private int buyerId;
        private int sellerId; // Added sellerId
        private String eventName;
        private int startDate;
        private int endDate;
        private double ticketPrice;
        private String additionalInfo;
        private boolean negotiable;
        private int numTickets;
        private int status;
        private String buyerUsername;
        private String buyerPhone;
        private String buyerSocials;

        public TicketOffer(int ticketId, int buyerId, int sellerId, String eventName, int startDate, int endDate, double ticketPrice, String additionalInfo,
                           boolean negotiable, int numTickets, int status, String buyerUsername, String buyerPhone, String buyerSocials) {
            this.ticketId = ticketId;
            this.buyerId = buyerId;
            this.sellerId = sellerId; // Initialize sellerId
            this.eventName = eventName;
            this.startDate = startDate;
            this.endDate = endDate;
            this.ticketPrice = ticketPrice;
            this.additionalInfo = additionalInfo;
            this.negotiable = negotiable;
            this.numTickets = numTickets;
            this.status = status;
            this.buyerUsername = (buyerUsername == null || buyerUsername.isEmpty()) ? "None" : buyerUsername;
            this.buyerPhone = (buyerPhone == null || buyerPhone.isEmpty()) ? "None" : buyerPhone;
            this.buyerSocials = (buyerSocials == null || buyerSocials.isEmpty()) ? "None" : buyerSocials;
        }

        public int getTicketId() {
            return ticketId;
        }

        public String getEventName() {
            return eventName;
        }

        public int getStartDate() {
            return startDate;
        }

        public int getEndDate() {
            return endDate;
        }

        public double getTicketPrice() {
            return ticketPrice;
        }

        public String getAdditionalInfo() {
            return additionalInfo;
        }

        public boolean isNegotiable() {
            return negotiable;
        }

        public int getNumTickets() {
            return numTickets;
        }

        public int getStatus() {
            return status;
        }

        public String getBuyerUsername() {
            return buyerUsername;
        }

        public String getBuyerPhone() {
            return buyerPhone;
        }

        public String getBuyerSocials() {
            return buyerSocials;
        }

        public int getSellerId() {
            return sellerId;
        }
        
        public int getBuyerId() {
            return buyerId;
        }
    }
}
