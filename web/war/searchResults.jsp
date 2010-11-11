<%-- 
    Document   : searchResults.jsp
    Created on : 09/11/2010
    Author     : thau@google.com
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<%@page contentType="text/html" import="java.util.*" %>

<html>
    <head>
 <title>Polygon Search Results</title>
		
        
    </head>
    <body>
    
    index : table id : table name: row id : row name <br/>
 <%
    ArrayList<HashMap<String, String>> result = (ArrayList<HashMap<String,String>>) session.getAttribute("polygonNames");
    for (HashMap<String,String> item : result) {
  %>
    <%= item.get("index")%> : <%= item.get("table_id") %> : <%= item.get("table_name") %> : <%= item.get("name") %> : <%= item.get("description") %> <br/>
 
  <% } %>   
    
</body>
</html>
