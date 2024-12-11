import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/CheckIfFavoriteTicket")
public class CheckIfFavoriteTicket extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            // Retrieve form parameters
            int userID = Integer.parseInt(request.getParameter("userID"));
            int ticketID = Integer.parseInt(request.getParameter("ticketID"));

            // Check if the ticket is in the user's favorites
            boolean isFavorite = isFavoriteExists(userID, ticketID);

            // Return true or false as JSON response
            response.setStatus(HttpServletResponse.SC_OK);
            out.println("{\"isFavorite\": " + isFavorite + "}");
            System.out.println("Ticket " + ticketID + " user " + userID + " is a favorite: " + isFavorite);

        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Error: " + e.getMessage() + "\"}");
        }
    }

    // Helper function to check if the ticket is in the user's favorites
    private boolean isFavoriteExists(int userID, int ticketID) throws SQLException {
        String checkSQL = "SELECT COUNT(*) FROM favorites WHERE user_id = ? AND ticket_id = ?";
        try (Connection conn = MainDBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(checkSQL)) {

            ps.setInt(1, userID);
            ps.setInt(2, ticketID);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0; // If count > 0, the favorite exists
                }
            }
        }
        return false; // No favorite exists
    }
}
