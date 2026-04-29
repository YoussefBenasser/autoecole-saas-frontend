
import java.net.*;
import java.io.*;

public class TestAPI {
    public static void main(String[] args) throws Exception {
        URL loginUrl = new URL("http://localhost:8080/api/auth/login");
        HttpURLConnection loginCon = (HttpURLConnection) loginUrl.openConnection();
        loginCon.setRequestMethod("POST");
        loginCon.setRequestProperty("Content-Type", "application/json");
        loginCon.setDoOutput(true);
        String body = "{\"email\":\"ramzi@gmail.com\",\"password\":\"password\"}"; // Assume password
        try(OutputStream os = loginCon.getOutputStream()) {
            os.write(body.getBytes());
        }
        int code = loginCon.getResponseCode();
        System.out.println("Login code: " + code);
        if (code == 200) {
            String token = new BufferedReader(new InputStreamReader(loginCon.getInputStream())).readLine().replace("\"", "");
            System.out.println("Token: " + token.substring(0, 20) + "...");
            
            URL profUrl = new URL("http://localhost:8080/api/profile/me");
            HttpURLConnection profCon = (HttpURLConnection) profUrl.openConnection();
            profCon.setRequestMethod("GET");
            profCon.setRequestProperty("Authorization", "Bearer " + token);
            int pcode = profCon.getResponseCode();
            System.out.println("Profile code: " + pcode);
            InputStream is = (pcode >= 400) ? profCon.getErrorStream() : profCon.getInputStream();
            if (is != null) {
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                String line;
                while((line = br.readLine()) != null) System.out.println(line);
            }
        } else {
            InputStream is = loginCon.getErrorStream();
            if (is != null) {
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
               System.out.println(br.readLine());
            }
        }
    }
}

