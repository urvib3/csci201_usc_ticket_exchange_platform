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
import com.google.gson.JsonArray;

@WebServlet("/Search")
public class Search extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		System.out.println("Getting all tickets"); 
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		PrintWriter out = response.getWriter();

//		String username = request.getParameter("username");
//		String keywords = request.getParameter("keywords");
//		String minPriceString = request.getParameter("minPrice");
//		String maxPriceString = request.getParameter("maxPrice");
//		String startDateString = request.getParameter("startDate");
//		String endDateString = request.getParameter("endDate");
//
//		float minPrice = Float.parseFloat(minPriceString);
//		float maxPrice = Float.parseFloat(maxPriceString);
//		int startDate = Integer.parseInt(startDateString);
//		int endDate = Integer.parseInt(endDateString);

//		static String DB_URL = "jdbc:mysql://localhost/TicketExchange?user=root&password=root";
		
		try(Connection conn = MainDBConnection.getConnection()) {
			String entireTable = getAllTickets(conn);
			out.print(entireTable);
			out.flush();
        }
        catch (Exception e) {
        	throw new ServletException(e);
        }
        
    }
	
	private static String getAllTickets(Connection conn) {
		String st = "SELECT * FROM tickets WHERE status=0";
		JsonArray jsonArray = new JsonArray();
		try {
			PreparedStatement pst = conn.prepareStatement(st);
			ResultSet rs = pst.executeQuery();
			
			ResultSetMetaData metaData = rs.getMetaData();
			int columnCount = metaData.getColumnCount();

			
			while(rs.next()) {
				JsonObject currentEntry = new JsonObject();

	            for (int i = 1; i <= columnCount; i++) {
	                String columnName = metaData.getColumnName(i);
	                Object columnValue = rs.getObject(i);

	                if (columnValue == null) {
	                	currentEntry.addProperty(columnName, (String) null);
	                }
	                else if (columnValue instanceof Number) {
	                	currentEntry.addProperty(columnName, (Number) columnValue);
	                }
	                else if (columnValue instanceof Boolean) {
	                	currentEntry.addProperty(columnName, (Boolean) columnValue);
	                }
	                else {
	                	currentEntry.addProperty(columnName, columnValue.toString());
	                }
	            }

	            jsonArray.add(currentEntry);
			}
			return jsonArray.toString();
		}
		catch (Exception e) {
			System.out.println();
		}
		
		return "hi";
		
	}
    
}
    