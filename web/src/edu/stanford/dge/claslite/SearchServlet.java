package edu.stanford.dge.claslite;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.*;

//import br.org.imazon.sad.FusionTablesAccess;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;

@SuppressWarnings("serial")
public class SearchServlet extends HttpServlet {
	
	private static final String SERVICE_URL =
	    "http://www.google.com/fusiontables/api/query";
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		
		try {
			
			HttpSession session = req.getSession();
			

			String password = PrivateData.getPassword();
			
			FusionTablesAccess access = new FusionTablesAccess("carnegieclaslite",password);
			//FusionTablesAccess access = new FusionTablesAccess("imazonsad","foobar");
			HashMap<String, String> tables = access.getTables();
			ArrayList<HashMap<String, String>> polygons = access.getPolygons(req.getQueryString(), tables);
			session.setAttribute("polygonNames", polygons);
			resp.sendRedirect("/searchResults.jsp");	

		} catch (AuthenticationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ServiceException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	// not currently used
	private String formatAccess(ArrayList<ArrayList<String>> message) {
		StringBuffer result = new StringBuffer();
		for (ArrayList<String> item : message) {
			result.append(item.get(0) + " " + item.get(1) + " " + item.get(2)+ "<br>");
		}
		
		return result.toString();
	}
	
}
