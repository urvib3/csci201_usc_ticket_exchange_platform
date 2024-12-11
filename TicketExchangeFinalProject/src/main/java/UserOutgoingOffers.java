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

@WebServlet("/UserOutgoingOffers")
public class UserOutgoingOffers extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int userID = Integer.parseInt(request.getParameter("user_id"));
            List<Integer> ticketIds = getTicketIdsBySellerId(userID);

            if (ticketIds.isEmpty()) {
                out.println("[]");
                return;
            }

            JsonArray ticketsJsonArray = getTicketsJson(ticketIds);
            out.println(ticketsJsonArray.toString());

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    private List<Integer> getTicketIdsBySellerId(int sellerID) throws SQLException {
        List<Integer> ticketIds = new ArrayList<>();

        String sql = "SELECT ticket_id FROM offers WHERE buyer_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, sellerID);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ticketIds.add(rs.getInt("ticket_id"));
                }
            }
        }
        return ticketIds;
    }

    private JsonArray getTicketsJson(List<Integer> ticketIds) throws SQLException {
        JsonArray ticketsJsonArray = new JsonArray();

        StringBuilder sql = new StringBuilder("SELECT ticketID, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status FROM tickets WHERE ticketID IN (");
        for (int i = 0; i < ticketIds.size(); i++) {
            sql.append("?");
            if (i < ticketIds.size() - 1) {
                sql.append(", ");
            }
        }
        sql.append(")");

        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < ticketIds.size(); i++) {
                ps.setInt(i + 1, ticketIds.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    JsonObject ticketJson = new JsonObject();
                    ticketJson.addProperty("ticketID", rs.getInt("ticketID"));
                    ticketJson.addProperty("eventName", rs.getString("eventName"));
                    ticketJson.addProperty("ticketPrice", rs.getDouble("ticketPrice"));
                    ticketJson.addProperty("additionalInfo", rs.getString("additionalInfo"));
                    ticketJson.addProperty("negotiable", rs.getBoolean("negotiable"));
                    ticketJson.addProperty("numTickets", rs.getInt("numTickets"));
                    ticketJson.addProperty("status", rs.getInt("status"));
                    ticketJson.addProperty("startDate", formatDate(rs.getInt("startDate")));
                    ticketJson.addProperty("endDate", formatDate(rs.getInt("endDate")));
                    ticketsJsonArray.add(ticketJson);
                }
            }
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
}