import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonArray;

@WebServlet("/Favorites")
public class Favorites extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
//		System.out.println("Getting all tickets"); 
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		PrintWriter out = response.getWriter();

		int user_id = Integer.parseInt(request.getParameter("user_id"));
		
		try(Connection conn = MainDBConnection.getConnection()) {
			String entireTable = fetchFavorites(conn, user_id);
			out.print(entireTable);
			out.flush();
        }
        catch (Exception e) {
        	throw new ServletException(e);
        }
        
    }
	
	private static String fetchFavorites(Connection conn, int user_id) {
		String st = "SELECT favorites FROM users WHERE user_id = ?";
		JsonArray jsonArray = new JsonArray();
		try {
			PreparedStatement pst = conn.prepareStatement(st);
			pst.setInt(1, user_id);
			ResultSet rs = pst.executeQuery();
			
			if (rs.next()) {
                String favoritesJson = rs.getString("favorites");
                
                if (favoritesJson != null && !favoritesJson.isEmpty()) {
                    jsonArray = JsonParser.parseString(favoritesJson).getAsJsonArray();
                }
                
            }
			return jsonArray.toString();
			
		}
		catch (Exception e) {
			System.out.println();
		}
		
		return "hi";
		
	}
    
}
    