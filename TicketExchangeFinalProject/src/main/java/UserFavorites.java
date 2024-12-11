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

@WebServlet("/UserFavorites")
public class UserFavorites extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int userID = Integer.parseInt(request.getParameter("user_id"));
            List<Ticket> favoriteTickets = getFavoriteTicketsByUserId(userID);

            if (favoriteTickets.isEmpty()) {
                out.println("[]");
                return;
            }

            JsonArray ticketsJsonArray = getTicketsJson(favoriteTickets);
            out.println(ticketsJsonArray.toString());

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    private List<Ticket> getFavoriteTicketsByUserId(int userID) throws SQLException {
        List<Ticket> favoriteTickets = new ArrayList<>();

        // SQL query to get the tickets from favorites table
        String sql = "SELECT f.ticket_id, t.eventName, t.startDate, t.endDate, t.ticketPrice, t.additionalInfo, t.negotiable, t.numTickets, t.status, t.user_id AS seller_id "
                   + "FROM favorites f "
                   + "JOIN tickets t ON f.ticket_id = t.ticketID "
                   + "WHERE f.user_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userID);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int ticketId = rs.getInt("ticket_id");
                    String eventName = rs.getString("eventName");
                    int startDate = rs.getInt("startDate");
                    int endDate = rs.getInt("endDate");
                    double ticketPrice = rs.getDouble("ticketPrice");
                    String additionalInfo = rs.getString("additionalInfo");
                    boolean negotiable = rs.getBoolean("negotiable");
                    int numTickets = rs.getInt("numTickets");
                    int status = rs.getInt("status");
                    int sellerId = rs.getInt("seller_id");

                    // Create Ticket object with all the necessary details
                    favoriteTickets.add(new Ticket(ticketId, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status, sellerId));
                }
            }
        }
        return favoriteTickets;
    }

    private JsonArray getTicketsJson(List<Ticket> favoriteTickets) {
        JsonArray ticketsJsonArray = new JsonArray();

        for (Ticket ticket : favoriteTickets) {
            JsonObject ticketJson = new JsonObject();
            ticketJson.addProperty("ticketID", ticket.getTicketId());
            ticketJson.addProperty("eventName", ticket.getEventName());
            ticketJson.addProperty("ticketPrice", ticket.getTicketPrice());
            ticketJson.addProperty("additionalInfo", ticket.getAdditionalInfo());
            ticketJson.addProperty("negotiable", ticket.isNegotiable());
            ticketJson.addProperty("numTickets", ticket.getNumTickets());
            ticketJson.addProperty("status", ticket.getStatus());
            ticketJson.addProperty("startDate", formatDate(ticket.getStartDate()));
            ticketJson.addProperty("endDate", formatDate(ticket.getEndDate()));
            ticketJson.addProperty("sellerID", ticket.getSellerId());

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

    // Inner class to hold ticket information
    private static class Ticket {
        private int ticketId;
        private String eventName;
        private int startDate;
        private int endDate;
        private double ticketPrice;
        private String additionalInfo;
        private boolean negotiable;
        private int numTickets;
        private int status;
        private int sellerId;

        public Ticket(int ticketId, String eventName, int startDate, int endDate, double ticketPrice, String additionalInfo,
                      boolean negotiable, int numTickets, int status, int sellerId) {
            this.ticketId = ticketId;
            this.eventName = eventName;
            this.startDate = startDate;
            this.endDate = endDate;
            this.ticketPrice = ticketPrice;
            this.additionalInfo = additionalInfo;
            this.negotiable = negotiable;
            this.numTickets = numTickets;
            this.status = status;
            this.sellerId = sellerId;
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

        public int getSellerId() {
            return sellerId;
        }
    }
}
